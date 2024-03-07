const repos = require('@/repos.json')

export default async function sitemap() {
  const repoPages = repos.map((repo) => {
    return {
      url: `https://go.sazak.io/${repo.go_package}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    }
  })

  return [
    {
      url: 'https://go.sazak.io',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1
    },
    ...repoPages
  ]
}
