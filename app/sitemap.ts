import { allPosts } from "contentlayer/generated"
import { siteMetaData } from "@/data/sitemetadata"

export default async function sitemap() {
    const posts = allPosts.map(post => ({
        url: `${siteMetaData.siteUrl}${post.slug}`,
        lastModified: post.updateTime ? post.updateTime : post.updateTime,
    }))

    const routes = ['', '/post', '/about-me'].map(route => ({
        url: `${siteMetaData.siteUrl}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
    }))

    return [...routes, ...posts]
}