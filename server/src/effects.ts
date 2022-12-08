import * as alt from 'alt-server';
import EFFECT from '@AthenaShared/enums/effects';
import { Item } from '@AthenaShared/interfaces/item';
import IAttachable from '@AthenaShared/interfaces/iAttachable';
import { ANIMATION_FLAGS } from '@AthenaShared/flags/animationFlags';
import { Athena } from '@AthenaServer/api/athena';
import { VITAL_NAMES } from '../../shared/enums';
import { VitalsSystem } from './system';
import { BONES } from '@AthenaShared/enums/bones';

const defaultFoodAttachable: IAttachable = {
    model: 'prop_sandwich_01',
    bone: BONES.SKEL_R_Hand,
    pos: { x: 0.15, y: -0.02, z: -0.05 },
    rot: { x: -180, y: -150, z: -95 },
};

const defaultWaterAttachable: IAttachable = {
    model: 'prop_ld_flow_bottle',
    bone: BONES.SKEL_R_Hand,
    pos: { x: 0.13, y: 0, z: -0.05 },
    rot: { x: 100, y: -220, z: 180 },
};

export class InternalFunctions {
    /**
     * When the player eats or drinks, the player's vital is adjusted by the amount of the item.
     * An animation or a sound is also played dependent on the data passed inside of the item itself.
     *
     * @param player - alt.Player - The player who is receiving the item.
     * @param {Item} item - Item - The item that was consumed.
     * @param {VITAL_NAMES} vitalsName - The name of the vital that was changed.
     */
    static handleVitalsChange(player: alt.Player, item: Item, vitalsName: VITAL_NAMES) {
        VitalsSystem.adjustVital(player, vitalsName, item.data.amount);
        Athena.player.inventory.notify(player, `+${item.data.amount} ${vitalsName}`);

        if (item.data.sound) {
            Athena.player.emit.sound3D(player, item.data.sound, player);
        }

        const prevAttachedObject = player.getLocalMeta('effectsProp') as IAttachable;

        if (prevAttachedObject !== undefined) {
            Athena.player.emit.objectRemove(player, prevAttachedObject.uid);
        }

        player.deleteLocalMeta('effectsProp');

        if (vitalsName === VITAL_NAMES.FOOD) {
            const attachedObject: IAttachable = {
                uid: `vital-effect-prop-${item.model ? item.model : defaultFoodAttachable.model}`,
                model: item.model || defaultFoodAttachable.model,
                bone: item.data.bone || defaultFoodAttachable.bone,
                pos: item.data.pos || defaultFoodAttachable.pos,
                rot: item.data.rot || defaultFoodAttachable.rot,
            };

            Athena.player.emit.objectAttach(player, attachedObject, 6000);
            Athena.player.emit.animation(
                player,
                'amb@code_human_wander_eating_donut@male@idle_a',
                'idle_c',
                ANIMATION_FLAGS.UPPERBODY_ONLY | ANIMATION_FLAGS.ENABLE_PLAYER_CONTROL,
                6000,
            );
            player.setLocalMeta('effectsProp', attachedObject);
        }

        if (vitalsName === VITAL_NAMES.WATER) {
            const attachedObject: IAttachable = {
                uid: `vital-effect-prop-${item.model ? item.model : defaultWaterAttachable.model}`,
                model: item.model || defaultWaterAttachable.model,
                bone: item.data.bone || defaultWaterAttachable.bone,
                pos: item.data.pos || defaultWaterAttachable.pos,
                rot: item.data.rot || defaultWaterAttachable.rot,
            };

            Athena.player.emit.objectAttach(player, attachedObject, 5000);
            Athena.player.emit.animation(
                player,
                'amb@world_human_drinking@beer@male@idle_a',
                'idle_c',
                ANIMATION_FLAGS.UPPERBODY_ONLY | ANIMATION_FLAGS.ENABLE_PLAYER_CONTROL,
                5000,
            );
            player.setLocalMeta('effectsProp', attachedObject);
        }
    }
}

export class VitalsEffects {
    /**
     * It adds an effect to the item that will change the player's vitals when the item is consumed.
     */
    static init() {
        Athena.systems.effects.add(EFFECT.EFFECT_FOOD, (player: alt.Player, item: Item) => {
            if (!item || !item.data || !item.data.amount) {
                return;
            }

            InternalFunctions.handleVitalsChange(player, item, VITAL_NAMES.FOOD);
        });

        Athena.systems.effects.add(EFFECT.EFFECT_WATER, (player: alt.Player, item: Item) => {
            if (!item || !item.data || !item.data.amount) {
                return;
            }

            InternalFunctions.handleVitalsChange(player, item, VITAL_NAMES.WATER);
        });
    }
}
