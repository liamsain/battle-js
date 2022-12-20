export function players() {
  let players: {name: string}[] = [];
  function updatePlayers(p: {name: string}[]) {
    players = p;
  }
  function mount(el: HTMLDivElement) {
    el.innerHTML = render();
  }
  function render() {
    const playersMarkup = players.map(x => `<div>${x.name}</div>`);
    return `
      <h4>Players</h4>
      ${playersMarkup}
    `
  }
  return {
    updatePlayers,
    render,
    mount
  }
}