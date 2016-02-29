//#include <log.js>
//#include <Graphics.js>
//#include <CassSolver.js>

/** @constructor */
function Rectangle(x,y,w,h)
{
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
}

Rectangle.prototype = {
    union: function( other )
    {
        if ( other.x < this.x ) {
            this.width += this.x - other.x;
            this.x = other.x;
        }
        if ( other.y < this.y ) {
            this.height += this.y - other.y;
            this.y = other.y;
        }

        if ( other.x + other.width > this.x + this.width ) {
            this.width += other.x + other.width - this.x - this.width;
        }

        if ( other.y + other.height > this.y + this.height ) {
            this.height += other.y + other.height - this.y - this.height;
        }
    }
};

/** @constructor */
function Box()
{
    var id = Box.NextID++;
    this.id = id;
    this._x = new c.Variable({name: "x" + id, value:0});
    this._y = new c.Variable({name: "y"+id, value:0});
    this._width = new c.Variable({name: "w"+id, value:0});
    this._height = new c.Variable({name: "h"+id, value:0});
    this._right = c.plus(this._x, this._width);
    this._bottom = c.plus(this._y, this._height);

    this._centreX = c.plus(this._x, c.times(this._width, new c.Expression(0.5)));
    this._centreY = c.plus(this._y, c.times(this._height, new c.Expression(0.5)));
}

Box.NextID = 1;

Box.prototype = {
    /** @param {string} name
    */
    setName: function(name) {
        this._x.name = name + ".x" + this.id;
        this._y.name = name + ".y" + this.id;
        this._width.name = name + ".w" + this.id;
        this._height.name = name + ".h" + this.id;
    },

    /** @param {number=} val
        @return {number}
    */
    x: function(val) {
        if (arguments.length) {
            this._x.value = val;
        }
        return this._x.value;
    },

    /** @param {number=} val
        @return {number}
    */
    y: function(val) {
        if (arguments.length) {
            this._y.value = val;
        }
        return this._y.value;
    },

    /** @param {number=} val
        @return {number}
    */
    width: function(val) {
        if (arguments.length) {
            this._width.value = val;
        }
        return this._width.value;
    },

    /** @param {number=} val
        @return {number}
    */
    height: function(val) {
        if (arguments.length) {
            this._height.value = val;
        }
        return this._height.value;
    },

    /** @return {number}
    */
    centreX: function() {
        return this.x() + this.width() / 2;
    },

    /** @return {number}
    */
    centreY: function() {
        return this.y() + this.height() / 2;
    },

    /** @return {number}
    */
    right: function() {
        return this.x() + this.width();
    },

    /** @return {number}
    */
    bottom: function() {
        return this.y() + this.height();
    },

    /** @return {Rectangle}
    */
    toRectangle: function() {
        return new Rectangle(this._x.value, this._y.value, this._width.value, this._height.value);
    },

    /** @param {c.SimplexSolver} solver
        @param {number} value
     */
    widthAtLeast: function(solver, value) {
        var equation = new c.Inequality(this._width, c.GEQ, new c.Expression(value));
        solver.addConstraint(equation);
    },

    /** @param {c.SimplexSolver} solver
        @param {number} value
     */
    widthEquals: function(solver, value) {
        var equation = new c.Equation(this._width, new c.Expression(value));
        solver.addConstraint(equation);
    },    

    /** @param {c.SimplexSolver} solver
        @param {number} value
     */
    heightAtLeast: function(solver, value) {
        var equation = new c.Inequality(this._height, c.GEQ, new c.Expression(value));
        solver.addConstraint(equation);
    },
    
    /** @param {c.SimplexSolver} solver
        @param {number} value
     */
    heightEquals: function(solver, value) {
        var equation = new c.Equation(this._height, new c.Expression(value));
        solver.addConstraint(equation);
    },

    /** @param {c.SimplexSolver} solver
     */
    small: function(solver) {
        solver.addConstraint(new c.Equation(this._width, new c.Expression(0), c.Strength.weak));
        solver.addConstraint(new c.Equation(this._height, new c.Expression(0), c.Strength.weak));
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
        @param {number} margin
     */
    rightOf: function(solver, box, margin) {
        var t1 = c.plus(box._right, new c.Expression(margin));
        var t2 = new c.Inequality(t1, c.LEQ, this._x);
        solver.addConstraint(t2);        
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
        @param {number} margin
     */
    leftOf: function(solver, box, margin) {
        var t1 = c.minus(box._x, new c.Expression(margin));
        solver.addConstraint(new c.Inequality(this._right, c.LEQ, t1));
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
        @param {number} margin
     */
    placeRightOf: function(solver, box, margin) {
        var t1 = c.plus(box._right, new c.Expression(margin));
        var t2 = new c.Equation(t1, this._x);
        solver.addConstraint(t2);        
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
        @param {number} margin
     */
    placeLeftOf: function(solver, box, margin) {
        var t1 = c.minus(box._x, new c.Expression(margin));
        solver.addConstraint(new c.Equation(this._right, t1));
    },


    /** @param {c.SimplexSolver} solver
        @param {Box} box
        @param {number} margin
     */
    under: function(solver, box, margin) {
        var t1 = c.plus(box._bottom, new c.Expression(margin));
        var t2 = new c.Inequality(t1, c.LEQ, this._y);
        solver.addConstraint(t2);        
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
        @param {number} margin
     */
    underHard: function(solver, box, margin) {
        var t1 = c.plus(box._bottom, new c.Expression(margin));
        var t2 = new c.Equation(t1, this._y);
        solver.addConstraint(t2);     
    },    

    dump: function() {
        console.log(this);
    },

    draw: function(ctx) {
        console.log("Draw box: %s,%s -> %s,%s", this._x.value, this._y.value,
            this._width.value, this._height.value);
        ctx.fillRect(this._x.value, this._y.value, this._width.value, this._height.value);
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
     */
    horizontalAlign: function(solver, box) {
        var e = new c.Equation(this._centreY, box._centreY);
        solver.addConstraint(e);
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
     */
    verticalAlign: function(solver, box) {
        var e = new c.Equation(this._centreX, box._centreX);
        solver.addConstraint(e);
    },

    alignTop: function(solver, box) {
        solver.addConstraint(new c.Equation(this._y, box._y));
    },

    alignRight: function(solver, box, margin) {
        solver.addConstraint(new c.Equation(this._right, c.minus(box._right, new c.Expression(margin||0))));
    },

    alignLeft: function(solver, box, margin) {
        solver.addConstraint(new c.Equation(this._x, c.plus(box._x, new c.Expression(margin||0))));
    },

    /** @param {c.SimplexSolver} solver
        @param {number} amount
        @param {Box} box
     */
    separateVerticalCentres: function(solver, box, amount) {
        var t1 = c.minus(box._centreX, this._centreX);
        solver.addConstraint(new c.Inequality(t1, c.GEQ, new c.Expression(amount)));
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
        @param {number} marginTop
        @param {number} marginRight
        @param {number} marginBottom
        @param {number} marginLeft
     */
    inside: function(solver, box, marginTop, marginRight, marginBottom, marginLeft) {
        solver.addConstraint(new c.Inequality(box._x, c.LEQ, c.minus(this._x, new c.Expression(marginLeft))));
        solver.addConstraint(new c.Inequality(box._y, c.LEQ, c.minus(this._y, new c.Expression(marginTop))));    
        solver.addConstraint(new c.Inequality(box._right, c.GEQ, c.plus(this._right, new c.Expression(marginRight))));    
        solver.addConstraint(new c.Inequality(box._bottom, c.GEQ, c.plus(this._bottom, new c.Expression(marginBottom))));
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
        @param {number} marginTop
        @param {number} marginRight
        @param {number} marginBottom
        @param {number} marginLeft
     */
    insideHard: function(solver, box, marginTop, marginRight, marginBottom, marginLeft) {
        solver.addConstraint(new c.Equation(box._x, c.minus(this._x, new c.Expression(marginLeft))));
        solver.addConstraint(new c.Equation(box._y, c.minus(this._y, new c.Expression(marginTop))));    
        solver.addConstraint(new c.Equation(box._right, c.plus(this._right, new c.Expression(marginRight))));    
        solver.addConstraint(new c.Equation(box._bottom, c.plus(this._bottom, new c.Expression(marginBottom))));
    },


    /** @param {c.SimplexSolver} solver
        @param {Box} box
     */
    sameWidth: function(solver, box) {
        var equation = new c.Equation(this._width, box._width);
        solver.addConstraint(new c.Equation(this._width, box._width));
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
     */
    sameHeight: function(solver, box) {
        solver.addConstraint(new c.Equation(this._height, box._height));
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
     */
    alignLeftEdgeToCentreOf: function(solver, box) {
        solver.addConstraint(new c.Equation(box._centreX, this._x));
    },

    /** @param {c.SimplexSolver} solver
        @param {Box} box
     */
    alignRightEdgeToCentreOf: function(solver, box) {
        solver.addConstraint(new c.Equation(box._centreX, this._right));
    }
};
