Handlebars.registerHelper('pretty_dig', function(d) {
    return new Handlebars.SafeString(pretty_dig(d));
});

Handlebars.registerHelper('pretty_date', function(d) {
    var ret = '';
    if (d) {
        ret = moment(d, 'DD.MM.YYYY').format('DD.MM.YYYY');
    }
    return new Handlebars.SafeString(ret);
});

Handlebars.registerHelper('graph_ost', function(o, g) {
    var n = 0;

    if (o > 100) {
        n = 3;
    } else if (o > 10) {
        n = 2;
    } else if (o > 0) {
        n = 1;
    }

    var s = '';
    for (var i=0; i < n; i++) {
        s = s + g;
    }

    return new Handlebars.SafeString(s);
})

function btn_ost(o) {
    var s = '';

    if (o > 100) {
        s = 'btn-success';
    } else if (o > 10) {
        s = 'btn-warning';
    } else if (o > 0) {
        s = 'btn-danger';
    }

    return s;       
}

Handlebars.registerHelper('btn_ost', function(o) {
    return new Handlebars.SafeString(btn_ost(o));
})

Handlebars.registerHelper('bar_ost', function(o) {
    var n = 0;

    if (o > 100) {
        n = 100;
    } else if (o > 10) {
        n = 50;
    } else if (o > 0) {
        n = 5;
    }

    return new Handlebars.SafeString(n);
})

Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {
    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l, r) { return l == r; },
        '===':      function(l, r) { return l === r; },
        '!=':       function(l, r) { return l != r; },
        '<':        function(l, r) { return l < r; },
        '>':        function(l, r) { return l > r; },
        '<=':       function(l, r) { return l <= r; },
        '>=':       function(l, r) { return l >= r; },
        'typeof':   function(l, r) { return typeof l == r; }
    }

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);
    }

    var result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});


Handlebars.registerHelper('capitaliseFirstLetter', function(string) {
    return new Handlebars.SafeString(string ? string.charAt(0).toUpperCase() + string.slice(1) : '');
})