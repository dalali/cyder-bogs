window.CB = window.CB || {};

// Simple state machine used by the top-level game
CB.StateMachine = {
  create(states, initial) {
    return {
      states,
      current: initial,
      enter(name, args) {
        if (this.states[this.current] && this.states[this.current].exit) {
          this.states[this.current].exit();
        }
        this.current = name;
        if (this.states[name] && this.states[name].enter) {
          this.states[name].enter(args || {});
        }
      },
      update(dt) {
        if (this.states[this.current] && this.states[this.current].update) {
          this.states[this.current].update(dt);
        }
      },
      render(ctx) {
        if (this.states[this.current] && this.states[this.current].render) {
          this.states[this.current].render(ctx);
        }
      },
      onKey(e) {
        if (this.states[this.current] && this.states[this.current].onKey) {
          this.states[this.current].onKey(e);
        }
      },
      onClick(x, y) {
        if (this.states[this.current] && this.states[this.current].onClick) {
          this.states[this.current].onClick(x, y);
        }
      },
    };
  }
};
