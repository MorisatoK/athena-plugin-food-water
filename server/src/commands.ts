import * as alt from 'alt-server';
import { VITAL_NAMES } from '../../shared/enums';
import { VitalsSystem } from './system';
import { PERMISSIONS } from '@AthenaShared/flags/permissionFlags';
import { command } from '@AthenaServer/decorators/commands';
import { Athena } from '@AthenaServer/api/athena';

class VitalsCommands {
    @command('setfood', '/setfood [amount]', PERMISSIONS.ADMIN)
    private static setFoodCommand(player: alt.Player, commandValue: string) {
        let value = parseInt(commandValue);

        if (isNaN(value)) {
            Athena.player.emit.message(player, Athena.controllers.chat.getDescription('setfood'));
            return;
        }

        value = VitalsSystem.normalizeVital(value);
        VitalsSystem.adjustVital(player, VITAL_NAMES.FOOD, value, true);
    }

    @command('setwater', '/setwater [amount]', PERMISSIONS.ADMIN)
    private static setWaterCommand(player: alt.Player, commandValue: string) {
        let value = parseInt(commandValue);

        if (isNaN(value)) {
            Athena.player.emit.message(player, Athena.controllers.chat.getDescription('setwater'));
            return;
        }

        value = VitalsSystem.normalizeVital(value);
        VitalsSystem.adjustVital(player, VITAL_NAMES.WATER, value, true);
    }
}
