module.exports.comp = {
	name: 'movement',

    order: 30,

    state: {
        // current state
        heading: 0, // radians
        running: false,
        jumping: false,

        // options:
        maxSpeed: 10,
        moveForce: 30,
        responsiveness: 15,
        runningFriction: 0,
        standingFriction: 2,

        airMoveMult: 0.5,
        jumpImpulse: 10,
        jumpForce: 12,
        jumpTime: 500, // ms
        airJumps: 1,

         // internal state
        _jumpCount: 0,
        _isJumping: 0,
        _currjumptime: 0,
    }
}


