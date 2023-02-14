module.exports = {
    PlayerEntry : class {
        constructor(id, numPoints) {
            this.id = id;
            this.numPoints = numPoints;
        }
    },
    HitEvent : class {
        constructor(shooterId, shotId) {
            this.shooterId = shooterId;
            this.shotId = shotId;
        }
    },
    Scoreboard : class {
        constructor(pointsPerHit) {
            this.pointsPerHit = pointsPerHit;
            this.playerEntries = [];
            this.hitEvents = [];
        }
        addPlayerEntry(p) {
            this.playerEntries.push(p);
        }
        getScores() {
            return this.playerEntries;
        }
        getRecentHitEvents(numEvents) {
            let startIndex = 0;
            if (this.hitEvents.length > numEvents) {
                startIndex = startIndex - numEvents;
            }
            return this.hitEvents.slice(startIndex, this.hitEvents.length);
        }
        addHitEvent(hitEvent) {
            this.playerEntries.forEach(playerEntry => {
                if (playerEntry.id === hitEvent.shooterId) {
                    playerEntry.numPoints += this.pointsPerHit;
                }
                if (playerEntry.id === hitEvent.shotId) {
                    playerEntry.numPoints -= this.pointsPerHit;
                }
            });
            this.hitEvents.push(hitEvent);

            //this can be used to limit how many hit events we store
            this.hitEvents = this.getRecentHitEvents(20);
        }
    },
  };

