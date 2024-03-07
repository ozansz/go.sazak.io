package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"slices"
	"strings"

	"github.com/google/go-github/v60/github"
)

const (
	authTokenEnv = "GITHUB_PUBLIC_REPO_READ_TOKEN"
	cliAppTopic  = "cli"
)

var (
	username  = flag.String("username", "", "GitHub username")
	hostname  = flag.String("hostname", "", "Go package index hostname")
	outPath   = flag.String("out", "repos.json", "Output file path")
	forceAuth = flag.Bool("force-authenticated", false, "You must set the "+authTokenEnv+" env var if you used this flag")
)

type Repo struct {
	Owner        string            `json:"owner"`
	Name         string            `json:"name"`
	Stars        uint              `json:"stars"`
	Description  string            `json:"desc"`
	GoPackage    string            `json:"go_package"`
	LatestTag    string            `json:"latest_tag"`
	AlphaRelease bool              `json:"alpha_release"`
	HasCLIApp    bool              `json:"has_cli_app"`
	Packages     map[string]string `json:"packages"`
	MasterBranch string            `json:"master_branch"`
}

type RepoArchive []*Repo

func main() {
	log.SetPrefix("sync-github-repos: ")
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	flag.Parse()
	validateFlags()

	cl := github.NewClient(nil)

	token := os.Getenv(authTokenEnv)
	if token != "" {
		log.Printf("Using auth token from env var: %s", authTokenEnv)
		cl = cl.WithAuthToken(token)
	} else {
		if *forceAuth {
			log.Fatalf("You must set the %s env var if you used the -force-authenticated flag", authTokenEnv)
		}
	}

	ctx := context.Background()
	repos := listRepos(ctx, cl, *username)

	repoByPkg := filterGoRepositories(ctx, cl, *hostname, repos)
	repoArchive := make(RepoArchive, 0, len(repos))
	for pkg, repo := range repoByPkg {
		repoArchive = append(repoArchive, &Repo{
			Owner:        repo.GetOwner().GetLogin(),
			Name:         repo.GetName(),
			Stars:        uint(repo.GetStargazersCount()),
			Description:  repo.GetDescription(),
			GoPackage:    pkg,
			HasCLIApp:    repo.Topics != nil && slices.Contains(repo.Topics, cliAppTopic),
			MasterBranch: repo.GetDefaultBranch(),
		})
	}

	populateLatestReleases(ctx, cl, repoArchive)
	populatePackages(ctx, cl, *username, repoArchive)

	b, err := json.MarshalIndent(repoArchive, "", "  ")
	must(err, "marshaling JSON")
	must(os.WriteFile(*outPath, b, 0644), "writing JSON to file")
}

func populatePackages(ctx context.Context, cl *github.Client, user string, repos RepoArchive) {
	var allPackages []*github.Package
	opt := &github.PackageListOptions{
		ListOptions: github.ListOptions{PerPage: 10},
		PackageType: github.String("container"),
	}
	for {
		repos, resp, err := cl.Users.ListPackages(ctx, user, opt)
		must(err, "listing packages")
		allPackages = append(allPackages, repos...)
		if resp.NextPage == 0 {
			break
		}
		opt.Page = resp.NextPage
	}

	for _, pkg := range allPackages {
		for _, r := range repos {
			if pkg.Repository.GetFullName() == r.Owner+"/"+r.Name {
				if r.Packages == nil {
					r.Packages = make(map[string]string)
				}
				r.Packages[pkg.GetName()] = fmt.Sprintf("ghcr.io/%s/%s:%s", user, pkg.GetName(), r.LatestTag)
			}
		}
	}
}

func populateLatestReleases(ctx context.Context, cl *github.Client, repos RepoArchive) {
	for _, r := range repos {
		release, resp, err := cl.Repositories.GetLatestRelease(ctx, r.Owner, r.Name)
		if resp.StatusCode == 404 {
			// This repo may have one pre-release
			releases, _, err := cl.Repositories.ListReleases(ctx, r.Owner, r.Name, nil)
			must(err, "listing releases")

			if len(releases) == 0 {
				// No stable or pre-release found
				continue
			}

			latest := releases[0]
			for _, rel := range releases {
				if rel.GetCreatedAt().After(latest.GetCreatedAt().Time) {
					latest = rel
				}
			}

			release = latest
		} else {
			must(err, "getting latest release")
		}

		if release != nil {
			r.LatestTag = release.GetTagName()

			pre := release.GetPrerelease()
			v0 := strings.HasPrefix(r.LatestTag, "v0.")
			r.AlphaRelease = pre || v0
		}
	}
}

func filterGoRepositories(ctx context.Context, cl *github.Client, hostname string, repos []*github.Repository) map[string]*github.Repository {
	goRepos := map[string]*github.Repository{}

	prefix := fmt.Sprintf("module %s", hostname)

	for _, repo := range repos {
		log.Println("Checking", repo.GetFullName(), "for go.mod file")

		content, _, _, err := cl.Repositories.GetContents(ctx, repo.GetOwner().GetLogin(), repo.GetName(), "go.mod", nil)
		if resp, ok := err.(*github.ErrorResponse); ok {
			if resp.Response.StatusCode == 404 {
				continue
			}
		}
		must(err, "getting go.mod file")
		if content == nil {
			continue
		}
		if content.Content == nil {
			log.Printf("empty go.mod file found in %s/%s", repo.GetOwner().GetLogin(), repo.GetName())
			continue
		}
		contentBytes, err := base64.StdEncoding.DecodeString(*content.Content)
		must(err, "decoding go.mod file")

		contentStr := strings.TrimSpace(string(contentBytes))

		log.Printf("go.mod file in %s/%s: %s", repo.GetOwner().GetLogin(), repo.GetName(), contentStr)

		if strings.HasPrefix(string(contentStr), prefix) {
			goPkg := strings.Split(contentStr, "\n")[0][7:]
			goPkg = strings.TrimPrefix(goPkg, hostname+"/")

			if _, ok := goRepos[goPkg]; ok {
				log.Fatal("duplicate go package found:", goPkg)
			}

			log.Printf("go.mod file in %s/%s has prefix %s, and Go package is: %s", repo.GetOwner().GetLogin(), repo.GetName(), prefix, goPkg)
			goRepos[goPkg] = repo
		}
	}
	return goRepos
}

func listRepos(ctx context.Context, cl *github.Client, user string) []*github.Repository {
	var allRepos []*github.Repository
	opt := &github.RepositoryListByUserOptions{
		ListOptions: github.ListOptions{PerPage: 10},
	}
	for {
		repos, resp, err := cl.Repositories.ListByUser(ctx, user, opt)
		must(err, "listing repositories")
		allRepos = append(allRepos, repos...)
		if resp.NextPage == 0 {
			break
		}
		opt.Page = resp.NextPage
	}
	return allRepos
}

func validateFlags() {
	if *username == "" {
		log.Fatal("username is required")
	}
	if *hostname == "" {
		log.Fatal("hostname is required")
	}
}

func must(err error, msg string) {
	if err == nil {
		return
	}
	if _, ok := err.(*github.RateLimitError); ok {
		err = fmt.Errorf("rate limited: %v", err)
	}
	if _, ok := err.(*github.AbuseRateLimitError); ok {
		err = fmt.Errorf("abuse rate limited: %v", err)
	}
	log.Fatalf("%s: %v", msg, err)
}
