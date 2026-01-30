import { Start, Update } from "nestjs-telegraf";
import { BotService } from "../bot.service";
import { prototype } from "events";
import { Context } from "telegraf";
import { Logger } from "@nestjs/common";

@Update()
export class StartUpdate{
    private readonly logger = new Logger(StartUpdate.name);
    constructor(private readonly botService: BotService){}

    @Start()
    async start(ctx: Context){
        const user = ctx.from;
        this.logger.log(`Yangi foydalanuvchi /start buyrug'ini yubordi: ${user?.username} (ID: ${user?.id})`);
        await this.botService.onStart(ctx);
    }
}