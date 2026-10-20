import { ObjectId } from "mongodb";
import { ApiError } from "./ApiError.js";

export function toObjectId(id, label = "ID") {
  if (!id || !ObjectId.isValid(id)) throw new ApiError(400, `Invalid ${label}`);
  return new ObjectId(id);
}
