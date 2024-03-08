# go.sazak.io

go.sazak.io is my personal Go package index, for Go packages with name `go.sazak.io/...`.

This repo provides the source code for the frontend and the backend of the package index.

The frontend is a Next.js app using shadcn as the UI framework.

The backend is a simple Go binary that collects my Go packages in my GitHub repositories and collects them into a single JSON file.

## License

This project is licensed under the terms of the GNU General Public License v3.0. See [LICENSE](LICENSE) for more information.

## Usage

### Running the backend

```sh
export GITHUB_PUBLIC_REPO_READ_TOKEN="your-github-personal-access-token"

go run cmd/sync-github-repos/main.go --username ozansz --hostname go.sazak.io --out ui/src/repos.json
```

### Running the frontend

```sh
cd ui

npm i
npm run dev
```

### How to add a new package/update package info after new release?

The `sync-github-repos` command will collect the packages from the **public** GitHub repositories of the user, which have a `go.mod` file that starts with `module go.sazak.io/`, and write them to a JSON file. The frontend will read this JSON file and display the packages.

To update the information on the website, you need to rebuild the compiled JSON file. As this project is using Vercel, you only need to commit the new JSON file to the `main` branch.

If you have a `pre-commit` hook that runs the `sync-github-repos` command, you can just push an empty commit via:

```bash
git commit --allow-empty -m "release"
```

After Vercel finishes the new deployment, the website will be updated with the new information.

Now you will need to update the latest version information on `pkg.go.dev`. You can do this by requesting the new version in the website by navigating to `https://pkg.go.dev/go.sazak.io/<package>@<version>`.

> One other way to update the information on `pkg.go.dev` is to run `go get` with Go proxy specified, for example: `GOPROXY=https://proxy.golang.org GO111MODULE=on go get go.sazak.io/gls@v1.4.2`. This did not work for me all the time though.

#### Important points

- The release tag -or version number- should follow the [semantic versioning rules](https://semver.org). It should start with `v` and be in the format of `vX.Y.Z`. Otherwise, `pkg.go.dev` will __probably__ not recognize the new version.

- It's handy to have a `pre-commit` hook that runs the `sync-github-repos` command. You can use the following script as a pre-commit hook:

```bash
#!/bin/sh

set -eo pipefail

go run cmd/sync-github-repos/main.go --username ozansz --hostname go.sazak.io --out ui/src/repos.json --force-authenticated
if [ $? -ne 0 ]; then
    echo "Pre-commit hook failed (content generation script)"
    exit 1
fi

git update-index --add ui/src/repos.json
```

> Don't forget to set the `GITHUB_PUBLIC_REPO_READ_TOKEN` environment variable locally.