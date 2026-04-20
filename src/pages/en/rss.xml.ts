import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
    const posts = await getCollection('blog', ({ id }) => {
        return id.startsWith('en/');
    });

    return rss({
        title: 'Daniel Malmqvist | Blog',
        description: 'Notes on BIM practice, geospatial data pipelines, and digital twin work for the AEC industry.',
        site: context.site || 'https://malmqvist.dev',
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.publishDate,
            description: post.data.description,
            // Calculate the correct slug from id e.g. "en/some-post" -> "some-post"
            link: `/en/blog/${post.id.split('/').pop()?.replace(/\.mdx?$/, '')}/`,
        })),
        customData: `<language>en-us</language>`,
    });
}
