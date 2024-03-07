const repos = require('@/repos.json')

import Head from 'next/head';
import { Separator } from '@/components/ui/separator'
import Link from 'next/link';

// export async function generateStaticParams() {
//     return repos.map(repo => repo.go_package)
// }

export async function getStaticPaths() {
    return {
        paths: repos.map(repo => ({ params: { slug: repo.go_package } })),
        fallback: false
  }
}

export default function RepoSlug({ params }) {
  const { slug } = params

  return (
    <div className="h-full flex flex-row align-center justify-center items-center mx-5">
        <Head>
            <meta name="go-import" content={`go.sazak.io/${slug} git https://github.com/ozansz/${slug}`}/>
			<meta name="go-source" content={`go.sazak.io/${slug} https://github.com/ozansz/${slug} https://github.com/ozansz/${slug}/tree/master{/dir} https://github.com/ozansz/${slug}/tree/master{/dir}/{file}#L{line}`}/>
        </Head>
        <div className="text-4xl">👋</div>
        <Separator orientation="vertical" className="mx-5 bg-white h-8" />
        <div className="text-lg font-light">Please refer to <Link className="underline-offset-4 underline" href={`https://pkg.go.dev/go.sazak.io/${slug}`} target="_blank">{`pkg.go.dev/go.sazak.io/${slug}`}</Link></div>
    </div>
  )
}

export async function generateMetadata({ params }) {
    const { slug } = params

    return {
        other: {
            'go-import': `go.sazak.io/${slug} git https://github.com/ozansz/${slug}`,
            'go-source': `go.sazak.io/${slug} https://github.com/ozansz/${slug} https://github.com/ozansz/${slug}/tree/master{/dir} https://github.com/ozansz/${slug}/tree/master{/dir}/{file}#L{line}`
        }
    }
}