import { allPosts } from "contentlayer/generated"
import { siteConfig } from "@/site.config"

export default async function sitemap() {
    const posts = allPosts.map(post => ({
        url: `${siteConfig.siteUrl}${post.slug}`,
        lastModified: new Date(post.updateTime ? post.updateTime : post.updateTime).toISOString()
    }))

    const routes = ['', '/post', '/about'].map(route => ({
        url: `${siteConfig.siteUrl}${route}`,
        lastModified: new Date().toISOString()
    }))

    return [...routes, ...posts]
}