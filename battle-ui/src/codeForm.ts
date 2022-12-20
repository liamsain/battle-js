const apiUrl = 'http://localhost:5000';
export function codeForm() {
  let name = '';
  let funcText = '';
  function submit() {
    try {
      const func = new Function("return " + funcText)();
    } catch(err) {
      alert(err);
    }
    const name = document.querySelector<HTMLInputElement>('#name');
    if (!name || !name.value.length) {
      return;
    }
    fetch(apiUrl + '/add-player', {
      method: 'POST',
      body: JSON.stringify({
        name: name.value,
        funcText
      }),
        headers: {
    'Content-Type': 'application/json'
  },
    })
    .then(r => r.json())
    .then(d => {
      console.log(d)
    });
  }
  function mount(el: HTMLDivElement) {
    el.innerHTML = render();
    document.querySelector('#codeFormSubmit')?.addEventListener('click', () => submit())
    document.querySelector('#name')?.addEventListener('input', (ev) => name = ev.target.value); 
    document.querySelector('#codeEntry')?.addEventListener('input', ev => funcText = ev.target.value);
  }
  function render() {
    return `
    <form onsubmit="return false">
      <fieldset>
        <legend>Code Entry</legend>
        <div>
          <label for="name" >Name</label>
        </div>
        <input id="name" placeholder="bada$$" autocomplete="off" maxlength="16" required/>
        <div>
          <label for="codeEntry">Code</label>
        </div>
        <textarea id="codeEntry" rows="20" cols="100">
function (arg) {
  // arg: {round: 1, maxRounds: 100, previousGuesses: [19, 2, 19, 20, 5]}
  return 20
}</textarea>
      </fieldset>
      <div style="text-align: right">
        <button type="submit" id="codeFormSubmit">Submit</button>
      </div>
    </form>
    `
  }
  return {
    render,
    mount,
    name
  }
}