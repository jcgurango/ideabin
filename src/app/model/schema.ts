import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "notes",
      columns: [
        { name: "text", type: "string" },
        { name: "tags", type: "string" },
        { name: "file_url", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "parent_id", type: "string" },
      ],
    }),
  ],
});
