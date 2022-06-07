export const Conditions: {[k: string]: ModdedConditionData & {innateName?: string}} = {
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
