import { Database } from "@nozbe/watermelondb";
import Note from "./note";
import adapter from "./adapter";

export default new Database({
  adapter,
  modelClasses: [Note],
});
