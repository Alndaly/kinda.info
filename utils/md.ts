export const extractFileUrl = (obj: any) => {
    if (obj?.type == "file") {
        return obj?.file?.url;
    }
    if (obj?.type == "external") {
        return obj?.external?.url;
    }
    return null;
};

export const rawText = (rich_texts: any) => {
    let raw = "";
    rich_texts?.map((item: any) => {
        raw += item?.plain_text || "";
    });
    return raw;
};

// sub pages doesn't have status field
export const pagePublished = (page: any) => {
    return page?.properties?.Status?.select?.name == "Unpublished" ? false : true;
};

// database id must be included in fitler params as it's the unique key for db cache.
export const filterBase = (dbID: string) => {
    return {
        database_id: dbID,
    };
};

export const filterSelect = (property: string, value: string) => {
    return {
        filter: {
            property: property,
            select: {
                equals: value,
            },
        },
    };
};

export const filterMultiSelect = (property: string, value: string) => {
    return {
        filter: {
            property: property,
            multi_select: {
                contains: value,
            },
        },
    };
};

export const filterText = (property: string, value: string) => {
    return {
        filter: {
            property: property,
            rich_text: {
                equals: value,
            },
        },
    };
};

interface sorterProps {
    property: string;
    direction: "descending" | "ascending";
}

export const sorterProperties = (props: sorterProps[]) => {
    const res = {
        sorts: props,
    };
    return res;
};

const heading_level_1 = "heading_1";
const heading_level_2 = "heading_2";
const heading_level_3 = "heading_3";

interface Item {
  title: string;
  id: string;
  items: Item[];
}

interface Items {
  items: Item[];
}

export type TableOfContents = Items;

export function getTableOfContents(blocks: Array<any>): TableOfContents {
  const root: TableOfContents = {
    items: new Array(),
  };

  blocks.map((block: any) => {
    const { id, type } = block;
    if (type != heading_level_1 && type != heading_level_2 && type != heading_level_3) {
      return;
    }

    const heading = block[type];
    const raw_context = rawText(heading?.rich_text);
    if (!raw_context) {
      return;
    }

    const item: Item = {
      title: raw_context,
      id: id,
      items: new Array(),
    };

    if (type == heading_level_1) {
      root.items.push(item);
    } else if (type == heading_level_2) {
      const parent = root.items[root.items.length - 1];
      if (parent) {
        parent.items.push(item);
      } else {
        // 2nd level heading without parent, just level up to root
        root.items.push(item);
      }
    } else {
      const grandparent = root.items[root.items.length - 1];
      if (grandparent) {
        const parent = grandparent.items[grandparent.items.length - 1];
        if (parent) {
          parent.items.push(item);
        } else {
          grandparent.items.push(item);
        }
      } else {
        root.items.push(item);
      }
    }
  });
  return root;
}
