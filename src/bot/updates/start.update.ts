import { Start, Update } from "nestjs-telegraf";
import { BotService } from "../bot.service";
import { Context } from "telegraf";
import { Logger } from "@nestjs/common";
import { UserService } from "src/modules/user/user.service";

@Update()
export class StartUpdate {
    private readonly logger = new Logger(StartUpdate.name);
    constructor(private readonly botService: BotService, private readonly userService: UserService) { }

    @Start()
    async start(ctx: Context): Promise<void> {
        await this.botService.onStart(ctx);
        return undefined; // nestjs-telegraf truthy qaytgan qiymatni reply(String(result)) qiladi – [object Object] oldini olish
    }
}