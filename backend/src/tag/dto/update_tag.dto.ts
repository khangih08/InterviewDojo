import { PartialType } from "@nestjs/swagger";
import { CreateTagDto } from "./create_tag.dto";

export class UpdateTagDto extends PartialType(CreateTagDto) {}
