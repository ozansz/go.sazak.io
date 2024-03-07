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