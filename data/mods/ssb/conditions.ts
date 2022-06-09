import {FS} from '../../../lib';
import {toID} from '../../../sim/dex-data';

// Similar to User.usergroups. Cannot import here due to users.ts requiring Chat
// This also acts as a cache, meaning ranks will only update when a hotpatch/restart occurs
const usergroups: {[userid: string]: string} = {};
const usergroupData = FS('config/usergroups.csv').readIfExistsSync().split('\n');
for (const row of usergroupData) {
	if (!toID(row)) continue;

	const cells = row.split(',');
	if (cells.length > 3) throw new Error(`Invalid entry when parsing usergroups.csv`);
	usergroups[toID(cells[0])] = cells[1].trim() || ' ';
}

export function getName(name: string): string {
	const userid = toID(name);
	if (!userid) throw new Error('No/Invalid name passed to getSymbol');

	const group = usergroups[userid] || ' ';
	return group + name;
}

export const Conditions: {[k: string]: ModdedConditionData & {innateName?: string}} = {
	journeyman: {
		noCopy: true,
		xcoord: 0,
		ycoord: 0,
		onStart() {
			this.add(`c:|${Math.floor(Date.now() / 1000)}|${getName('Journeyman')}|pog?`);
			this.add('-message', `(${xcoord}, ${ycoord})`);
			this.add('-message', `(${this.xcoord}, ${this.ycoord})`);
			this.add('-message', `(${source.xcoord}, ${source.ycoord})`);
		},
		onSwitchOut() {
			this.add(`c:|${Math.floor(Date.now() / 1000)}|${getName('Journeyman')}|not pog`);
		},
		onFaint() {
			this.add(`c:|${Math.floor(Date.now() / 1000)}|${getName('Journeyman')}|AAAAAAAAAAAAAAAAAAAAA`);
		},
	},
	badtox: {
		name: 'badtox',
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			this.effectState.stage = 4;
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'badtox', '[from] ability: ' + sourceEffect.name, '[of] ' + source);
			} else {
				this.add('-status', target, 'badtox');
			}
		},
		onSwitchIn() {
			this.effectState.stage = 3;
		},
		onResidualOrder: 9,
		onResidual(pokemon) {
			if (this.effectState.stage < 15) {
				this.effectState.stage++;
			}
			this.damage(this.clampIntRange(pokemon.baseMaxhp / 16, 1) * this.effectState.stage);
		},
	},
	hellscar: {
		name: 'hellscar',
		onStart(target, source, sourceEffect) {
			this.effectState.count = 1;
			this.add('-start', target, 'hellscar' + this.effectState.count);
			this.add('-message', `${target} was scarred!`);
		},
		onRestart(target) {
			if (this.effectState.count >= 5) return false;
			this.effectState.count++;
			this.add('-start', target, 'hellscar' + this.effectState.count);
			this.add('-message', `${target} was scarred!`);
		},
		onModifyDamage(damage, source, target, move) {
			if (this.effectState.count > 0 && move.type === "Fire") {
				return this.chainModify(1 + 0.1 * this.effectState.count);
			}
		},
	},
};
