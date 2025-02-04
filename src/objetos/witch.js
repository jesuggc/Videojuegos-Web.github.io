import WitchAttack from "./witchAttack.js";
import FireAttack from "./fireAttack.js";
import LightningAttack from "./lightningAttack.js";
import Wolf from "./wolf.js";
import Knight from "./knight.js";
import Enemy from "./enemy.js";
import Torquemada from "./torquemada.js";
import FireFlower from "./fireFlower.js";
import LightningFlower from "./lightningFlower.js";
import IceFlower from "./iceFlower.js";
import FreezeAttack from "./freezeAttack.js";
import PoisonFlower from "./poisonFlower.js";
import PoisonAttack from "./poisonAttack.js";
export default class Witch extends Phaser.GameObjects.Sprite {
	constructor(scene,x,y) {
		super(scene, x, y, 'witch');
		this.flowerArray = [false, false, false, false];
		this.direccion = new Phaser.Math.Vector2();
		this.health = 500;
		this.inCombat = false;
		this.experience = 0;
		this.isAlive = true;
		this.speed = 70; //SPEED
		this.maxHealth = 500; //HEALTH
		this.damage = 10; //DAMAGE
		this.shield = 0; //SHIELD
		this.healthRegen = 0.05; //LIFE REG
		this.rate = 800; //FIRE RATE
		this.speedJump = 7; // SPEED JUMP
		this.healthJump = 80; //HEALTH JUMP
		this.damageJump = 5; //DAMAGE JUMP
		this.shieldJump = 5; //SHIELD JUMP
		this.healthRegenJump = 0.04; // LIFE REG JUMP
		this.rateJump = 100; //FIRE RATE JUMP
		this.levelExp = [10,15,25,40,65,105,170,275,445,720,1165,1885,3050,4935,7985];
		this.level = 0;
		this.maxLevel = 15;
		this.isBurning = false;

		this.lastBasicAttack = 0;
		this.lastFireAttack = 0;
		this.fireAttackCooldown = 4000;
		this.lastLightningAttack = 0;
		this.lightningAttackCooldown = 2000;
		this.lastFreezeAttack = 0;
		this.freezeAttackCooldown = 1900;
		this.lastPoisonAttack = 0;
		this.poisonAttackCooldown = 900;


		
		this.maxAbilitiesLevels = 5;
		this.abilityLevels = new Map([
			["Speed", 0],
			["Health", 0],
			["Damage", 0],
			["Shield", 0],
			["Life  Reg.", 0],
			["Fire  Rate", 0] 
		]);
		
		this.onCollide = true;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.body.pushable = false;


		this.scene.anims.create({
			key: 'idleWitch',
			frames: this.scene.anims.generateFrameNumbers('witch', {start:0, end:8}),
			frameRate: 12,
			repeat: -1
		});
		
		this.scene.anims.create({
			key: 'runWitch',
			frames: this.scene.anims.generateFrameNumbers('witch', {start:0, end:8}),
			frameRate: 12,
			repeat: -1
		});
		
		this.play('idleWitch');
		
		this.wKey = this.scene.input.keyboard.addKey('W'); 
		this.aKey = this.scene.input.keyboard.addKey('A'); 
		this.sKey = this.scene.input.keyboard.addKey('S'); 
		this.dKey = this.scene.input.keyboard.addKey('D');
		
		this.testingKey = this.scene.input.keyboard.addKey('P');
		
		// COLLIDER
		this.body.setSize(this.width*0.2, this.height*0.4, true ); 
		

	}

	preUpdate(t, dt) {
		super.preUpdate(t, dt);
		this.body.setVelocity(0)
		this.direccion.x = 0;
		this.direccion.y = 0;
		
		if (t > this.lastBasicAttack + this.rate && this.scene.spawn) {	
			var enemy = this.scene.physics.closest(this, this.scene.enemyPool.children.entries);
			if (enemy && enemy.isAlive && enemy instanceof Enemy ) new WitchAttack(this.scene, this.x, this.y, enemy, this.damage);
		
			this.lastBasicAttack = t;
		}
		if (this.flowerArray[0]){
			if (t > this.lastFireAttack + this.fireAttackCooldown){
				this.fireAttack.play('idleFireAttack')
				this.fireAttack.setVisible(true);
				this.firecollider = this.scene.physics.add.overlap(this.fireAttack, this.scene.enemyPool, function(obj1, obj2) {
					if (!obj2.hasBeenDamaged) { 
						obj2.hasBeenDamaged = true; 
						obj2.receiveDamage(obj1.damage, '0xff0000'); 
					}
				});
				
				this.lastFireAttack = t;
				}
				this.fireAttack.on('animationcomplete', function() {
					this.firecollider.active=false;
					this.scene.enemyPool.getChildren().forEach(function(enemy) {
						enemy.hasBeenDamaged = false;
					});
					this.fireAttack.setVisible(false);
				}, this);
			}
		if (this.flowerArray[1]){
			if(t > this.lastLightningAttack + this.lightningAttackCooldown) {
				var enemy = this.scene.getRandomAlive();
				if (enemy){
					this.lightningAttack = new LightningAttack(this.scene, enemy.x, enemy.y - 30);
					enemy.receiveDamage(this.lightningAttack.damage, '0xffff00');
					this.lastLightningAttack = t;
				} 
			}
		}
		if (this.flowerArray[2]){
			if(t > this.lastFreezeAttack + this.freezeAttackCooldown && this.scene.spawn) {
				var enemy = this.scene.physics.closest(this, this.scene.enemyPool.children.entries);
				if (enemy){
					this.freezeAttack = new FreezeAttack(this.scene, this.x, this.y, enemy);		
					enemy.receiveDamage(this.freezeAttack.damage, '0x038cfc');
					this.lastFreezeAttack = t;
				} 
			}
		}
		if (this.flowerArray[3]){
			if(t > this.lastPoisonAttack + this.poisonAttackCooldown) {
				var enemy = this.scene.getRandomAlive();
				if (enemy){
					this.poisonAttack = new PoisonAttack(this.scene, this.x, this.y, enemy);
					this.lastPoisonAttack = t;
				} 
			}
		}

		if(this.scene.noname1){
			this.scene.noname1.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.scene.noname1.x, this.scene.noname1.y));
			this.scene.noname2.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.scene.noname2.x, this.scene.noname2.y));
		}
		
		this.scene.expbar.width = 366* this.experience/this.levelExp[this.level];
		this.scene.lifebar.width = 366 * this.health/this.maxHealth;
		
		if(this.health < this.maxHealth) this.health += this.healthRegen;
		
		// EXPERIENCIA
		if(this.experience >= this.levelExp[this.level] && this.level < this.maxLevel) this.levelUp();

		// TESTING BUTTON
		if(this.testingKey.isDown){
			this.speed = 500;
			this.health = 5000;
			this.maxHealth = 5000; //HEALTH
			this.healthRegen = 5; //LIFE REG
		}
		// MOVERSE A LA IZQUIERDA
		if (this.aKey.isDown) {
			this.setFlipX(true);
			this.direccion.x = -1;
		}
	
		// MOVERSE A LA DERECHA
		if (this.dKey.isDown) {
			this.setFlipX(false);
			this.direccion.x = 1;
		}
		if (this.wKey.isDown) this.direccion.y = -1;
		if (this.sKey.isDown) this.direccion.y = 1;

		this.direccion.normalize();

		this.body.setVelocityX(this.direccion.x * this.speed);
		this.body.setVelocityY(this.direccion.y * this.speed);
	
		if(Phaser.Input.Keyboard.JustUp(this.aKey) || Phaser.Input.Keyboard.JustUp(this.dKey) || Phaser.Input.Keyboard.JustUp(this.wKey)|| Phaser.Input.Keyboard.JustUp(this.sKey)) this.body.setVelocity(0);
	
		this.scene.levelText.setText(['L e v e l: ' + this.level ]);
	}
	winExperience(exp){
		if(this.level < this.maxLevel || this.experience < this.levelExp[this.level]) this.experience += exp;
	}
	perderVida(damage){
		let damageTaken = damage * ((100 - this.shield)/100);
		this.health -= damageTaken;
		this.setTintFill(0xff0000);
		
		this.scene.time.addEvent({delay: 150, callback: function(){
			this.clearTint();
        }, callbackScope: this});
		if(this.health<=0) this.isAlive=false;	
	}

	levelUp(){
		this.experience = 0;
		this.level++;
		this.body.setVelocity(0);
		this.scene.levelUp();
	}
	addRate(){
		this.rate -= this.rateJump;
		if(this.abilityLevels.get("Fire  Rate") < this.maxAbilitiesLevels) this.abilityLevels.set("Fire  Rate", this.abilityLevels.get("Fire  Rate") + 1); 
	}
	
	addHealth(){
		this.health += this.healthJump;
		this.maxHealth += this.healthJump;
		if(this.abilityLevels.get("Health") < this.maxAbilitiesLevels) this.abilityLevels.set("Health", this.abilityLevels.get("Health") + 1); 

	}
	
	addDamage(){
		this.damage += this.damageJump;
		if(this.abilityLevels.get("Damage") < this.maxAbilitiesLevels) this.abilityLevels.set("Damage", this.abilityLevels.get("Damage") + 1); 
	}

	addShield(){
		this.shield += this.shieldJump;
		if(this.abilityLevels.get("Shield") < this.maxAbilitiesLevels) this.abilityLevels.set("Shield", this.abilityLevels.get("Shield") + 1); 
	}
	
	addHealthRegen(){
		this.healthRegen += this.healthRegenJump;
		if(this.abilityLevels.get("Life  Reg.") < this.maxAbilitiesLevels) this.abilityLevels.set("Life  Reg.", this.abilityLevels.get("Life  Reg.") + 1);
	}
	
	addSpeed(){
		this.speed += this.speedJump;
		this.diagonalSpeed += this.diagonalSpeedJump;
		if(this.abilityLevels.get("Speed") < this.maxAbilitiesLevels) this.abilityLevels.set("Speed", this.abilityLevels.get("Speed") + 1);
	}

	guardarFlor(flor){
		if (flor instanceof FireFlower) {
			this.flowerArray[0]=true;
			this.createFire();
		}
		if (flor instanceof LightningFlower) this.flowerArray[1]=true; 
		if (flor instanceof IceFlower) this.flowerArray[2]=true;
		if (flor instanceof PoisonFlower) this.flowerArray[3]=true;
		this.scene.levelUpEnemies();
	}
	createFire(){
		this.fireAttack = new FireAttack(this.scene, this, this.x, this.y);
	}

}