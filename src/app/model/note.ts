import { Model } from "@nozbe/watermelondb";
import { field, text } from "@nozbe/watermelondb/decorators";

export default class Note extends Model {
  static table = "notes";

  @text("text") text;
}
