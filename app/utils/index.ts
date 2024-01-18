export const removeHtmlTag = (e: string) => {
    // 正则匹配删除富文本的标头
    return e.replace(/<[^>]*>|<\/[^>]*>/gm, "").replace(/&.*?;/gm, "");
};
