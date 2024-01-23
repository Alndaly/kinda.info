import { allPosts } from "contentlayer/generated"
import { siteMetaData } from "@/data/sitemetadata"

export default async function sitemap() {
    const posts = allPosts.map(post => ({
        url: `${siteMetaData.siteUrl}${post.slug}`,
        lastModified: post.date ? post.date : post.date,
    }))

    const routes = ['', '/post', '/about-me'].map(route => ({
        url: `${siteMetaData.siteUrl}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
    }))

    return [...routes, ...posts]
}