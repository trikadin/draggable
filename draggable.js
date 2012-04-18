/**
 * @author trikadin
 * @version 1.0
 */

/**
 * Делает элемент перетаскиваемым. Элементу доступны события dragstart, drag, dragend, drop
 * @param {Element} el Элемент для переноса
 * @param {Object} opt Второй параметр - это список опций переноса
 * @param {Boolean} [opt.inParent= false] В пределах оффсетного
 * @param {Object} [opt.borders= {t: -1/0, r: 1/0, b: 1/0, l: -1/0} ]
 * @paran {Boolean} [opt.low= false]
 * @param {Array} [opt.grid= [1, 1] ]
 * @param {Object} [opt.data]
 */
function make_draggable(el, opt) {
    // some code
};

function make_droppable(el) {
    // some code :)
}


(function(DEBUG_MODE){
    make_draggable= function(el, opt) {
        opt= opt || {};
        opt= {
            inParent: opt.inParent || false,
            borders: opt.borders || {},
            low: opt.low || false,
            grid: opt.grid || [1, 1],
            data: opt.data || null
        };
        opt.borders= {
            t: opt.borders.t || -1/0,
            r: opt.borders.r || 1/0,
            b: opt.borders.b || 1/0,
            l: opt.borders.l || -1/0
        };

        el.addEventListener("mousedown", function(e){init_mousepress(e, opt, this)} , false);
        debug("Element " +elem_info(el), el,
            " are draggable now!"
        );
    };

    var drop_targets=[];
    var drop_targets_rectangles=[];

    function cache_drop_targets() {
        drop_targets_rectangles= [];
        var _tar, tar_pos;
        for (var i=0; i!= drop_targets.length; ++i) {
            _tar= drop_targets[i]
            tar_pos= get_position(_tar);
            drop_targets_rectangles.push({
                t: tar_pos.t,
                r: tar_pos.l + _tar.offsetWidth,
                b: tar_pos.t + _tar.offsetHeight,
                l: tar_pos.l,
                target: _tar
            })
        }
        debug("drop_targets_rectangles: ", drop_targets_rectangles);
    }

    function get_current_target(t, l) {
        var _dtr= drop_targets_rectangles;
        for (var i=0; i!= _dtr.length; ++i) {
            if ((_dtr[i].l < l) &&
                (_dtr[i].r > l) &&
                (_dtr[i].t < t) &&
                (_dtr[i].b > t)
               ) {
                return _dtr[i].target;
            }
        }
        return null;
    }

    make_droppable= function(el) {
        drop_targets.push(el);
    };

    function debug() {
        if (DEBUG_MODE) {
            console.log.apply(console,
                [].concat.apply([], arguments)
            );
        }
    };

    function elem_info(el) {
        return el.tagName.toLowerCase() +
            (el.className && ("."+el.className.replace(/\s/g, "."))) +
            (el.id && ("#" + el.id))
    };

    /**
     * Вычисляем позицию элемента
     * @param {Element} elem элемент, позицию которого вычисляем
     * @return {Object}
     */
    function get_position(elem) {
            var box = elem.getBoundingClientRect();
            var body = document.body
            var docElem = document.documentElement
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
            var clientTop = docElem.clientTop || body.clientTop || 0
            var clientLeft = docElem.clientLeft || body.clientLeft || 0
            var top  = box.top +  scrollTop - clientTop
            var left = box.left + scrollLeft - clientLeft
            return { t: Math.round(top), l: Math.round(left) }
    };

    var mousepress_inited= false; // была ли нажата мышка на каком-либо d'n'd объекте
    var mousepressed_elem= null; // элемент, на который нажли мышкой
    var dragged_element= null; // элемент, который будет перетаскиваться
    var drag_options= null; // параметры драг-н-дропа того элемента
    var mouse_offsets= null; // расстояние от места клика на элементе до его координат
    var drag_started= false; // был ли начат перенос

    function init_mousepress(e, opt, elem){
        mousepress_inited= true;
        mousepressed_elem= elem;
        debug("position: ", get_position(elem));
        opt.elementPosition= get_position(elem);
        opt.startMousePosition= {l: e.pageX, t: e.pageY};
        drag_options= opt;
        mouse_offsets= {t: e.pageY - opt.elementPosition.t, // смещение мышки от верх. края объекта
            l: e.pageX - opt.elementPosition.l}; // смещение мышки от левого края объекта
        debug("Mousepress has been inited at " +elem_info(elem)+":", elem,
            "with options: ", opt,
            ", with event: ", e
        );
    };

    function remove_initialization() { // убирает все сведения об объекте переноса
        mousepress_inited= false;
        mousepressed_elem= null;
        drag_options= null;
        dragged_element= null;
        mouse_offsets= null;
        drag_started= false;
    };

    function dragstart(/* Event */ e) {
        var dragstart_event= document.createEvent("Event");
        dragstart_event.initEvent("dragstart", true, true);
        dragstart_event.options= drag_options;
        var _el= mousepressed_elem;
        if (!_el.dispatchEvent(dragstart_event)) { // если перенос был отменён на старте
            remove_initialization();
            debug("Start of draging has been canceled at " + elem_info(_el),
                _el,
                dragstart_event
            );
            return false;
        };
        dragged_element= _el;

        drag_started= true;
        var _opt= drag_options;
        _opt.mouseBorders= {
            t: _opt.borders.t,
            r: _opt.borders.r,
            b: _opt.borders.b,
            l: _opt.borders.l
        };

        var _mb= _opt.mouseBorders;
        if (_opt.inParent) {
            var _op= _el.offsetParent;
            var _ppos= get_position(_op);
            _ppos.r= _ppos.l + _op.offsetWidth;
            _ppos.b= _ppos.t + _op.offsetHeight;
            _opt.mouseBorders= {
                t: _mb.t > _ppos.t ? _mb.t : _ppos.t,
                r: _mb.r < _ppos.r ? _mb.r : _ppos.r,
                b: _mb.b < _ppos.b ? _mb.b : _ppos.b,
                l: _mb.l > _ppos.l ? _mb.l : _ppos.l
            };
        };
        _mb= _opt.mouseBorders;
        var _mo= mouse_offsets;

        debug("Mouse borders: ", _opt.mouseBorders);
        debug("_mb: ",  _mb, "_mo: ", _mo);
        _opt.mouseBorders= {
            t: _mb.t + _mo.t,
            r: _mb.r - _el.offsetWidth + _mo.l,
            b: _mb.b - _el.offsetHeight + _mo.t,
            l: _mb.l + _mo.l
        };

        cache_drop_targets();

        debug("Mouse borders: ", _opt.mouseBorders);
        debug("Draging has been started at " + elem_info(_el), _el,
            ", with event: ", dragstart_event
        );

    }

    function drag(/* Event */ e) {
        if (!mousepress_inited) // если не было нажатия на drag'n'drop'ный элемент
            return; // завершаем работу

        if (!drag_started && !dragstart(e)) { // если начала драг-н-дропа ещё не было
            return;
        };

        var _opt= drag_options;
        var _smp= _opt.startMousePosition;

        var mouse_shift= {
            t: e.pageY - _smp.t,
            l: e.pageX - _smp.l
        };
        _opt.mouseShift= mouse_shift;
        var drag_event= document.createEvent("Event");
        drag_event.initEvent("drag", true, true);
        drag_event.options= _opt;
        if (!dragged_element.dispatchEvent(drag_event)){
            return;
        };

        var _mb = _opt.mouseBorders;
        var _grid= _opt.grid;

        var _l= e.pageX - mouse_shift.l % _grid[0];


        if (e.pageX < _mb.l && _grid[0] !== 0) {
            _l= _mb.l;
            mouse_shift.l= _mb.l - _smp.l;
            _l-= mouse_shift.l % _grid[0];
        } else if (e.pageX > _mb.r && _grid[0] !== 0) {
            _l = _mb.r;
            mouse_shift.l= _mb.r - _smp.l;
            _l-= mouse_shift.l & _grid[0];
        };

        _l-= mouse_offsets.l;
        var _t= e.pageY - mouse_shift.t % _grid[1];

        if (e.pageY < _mb.t && _grid[1] !== 0) {
            _t= _mb.t;
            mouse_shift.t= _mb.t - _smp.t;
            _t-= mouse_shift.t % _grid[1]
        } else if (e.pageY > _mb.b && _grid[1] !== 0) {
            _t= _mb.b;
            mouse_shift.t= _mb.b - _smp.t;
            _t-= mouse_shift.t % _grid[1];
        };

        _t-= mouse_offsets.t;
        dragged_element.style.left= _l + "px";
        dragged_element.style.top= _t + "px";

        var acceptor= get_current_target(_t+mouse_offsets.t, _l+mouse_offsets.l);
        debug("acceptor: ", acceptor);
        leave(acceptor);
        enter(acceptor)

    };

    function drag_end(){
        if (!mousepress_inited) {
            return;
        } else if (!drag_started) {
            remove_initialization();
            return;
        }

        var _el= dragged_element;
        var _pos= get_position(_el);
        var acceptor= get_current_target(_pos.t + mouse_offsets.t, _pos.l + mouse_offsets.l);

        if (accept(acceptor)) {
            var drad_success_event= document.createEvent("Event");
            drad_success_event.initEvent("dragsuccess", true, false);
            drad_success_event.options= drag_options;
            _el.dispatchEvent(drad_success_event);
        } else {
            var drag_fail_event= document.createEvent("Event");
            drag_fail_event.initEvent("dragfail", true, false);
            drag_fail_event.options = drag_options;
            _el.dispatchEvent(drag_fail_event);
        }

        var drag_end_event= document.createEvent('Event');
        drag_end_event.initEvent("dragend", true, false);
        drag_end_event.options= drag_options;
        dragged_element .dispatchEvent(drag_end_event);

        remove_initialization();
    }

    function leave(new_acceptor) {
        if (drag_options.currentAcceptor && drag_options.currentAcceptor !== new_acceptor) {
            var leave_event= document.createEvent("Event");
            leave_event.initEvent("leave", true, false);
            leave_event.draggedElement= dragged_element;
            leave_event.options= drag_options;
            leave_event.toElement= new_acceptor;
            drag_options.currentAcceptor.dispatchEvent(leave_event);
            if (new_acceptor == null) {
                drag_options.currentAcceptor= null;
            }
        }
    }

    function enter(new_acceptor) {
        var _cur= drag_options.currentAcceptor;
        if (_cur === new_acceptor || !new_acceptor) {
            return;
        };

        var enter_event= document.createEvent("Event");
        enter_event.initEvent("enter", true, false);
        enter_event.draggedElement= dragged_element;
        enter_event.options= drag_options;
        enter_event.fromElement= _cur;
        new_acceptor.dispatchEvent(enter_event);
        drag_options.currentAcceptor= new_acceptor;
    }

    function accept(acceptor) {
        if (!acceptor) {
            return false;
        };
        var accept_event= document.createEvent("Event");
        accept_event.initEvent("accept", true, true);
        accept_event.draggedElement= dragged_element;
        accept_event.options = drag_options;
        return acceptor.dispatchEvent(accept_event);
    }

    document.addEventListener("mousemove", drag, false);
    document.addEventListener("mouseup", drag_end, false);

    debug("Library \"Draggable\" has been inited!");
})(false)