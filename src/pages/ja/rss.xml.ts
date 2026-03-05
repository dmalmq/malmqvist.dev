import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
    const posts = await getCollection('blog', ({ id }) => {
        return id.startsWith('ja/');
    });

    return rss({
        title: 'Daniel Malmqvist | ブログ',
        description: '建築、自動化エージェント、そしてAEC業界のためのより良いデータパイプライン構築に関する考え。',
        site: context.site || 'https://malmqvist.dev',
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.publishDate,
            description: post.data.description,
            // Calculate the correct slug from id e.g. "ja/some-post" -> "some-post"
            link: `/ja/blog/${post.id.split('/').pop()}/`,
        })),
        customData: `<language>ja-jp</language>`,
    });
}
