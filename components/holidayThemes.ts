
export function addHolidayTheme(){
  const today = new Date();
  if (today.getMonth() == 9 && today.getDate() == 31) {
    import('~/assets/styles/halloween/halloween.css');

    const witch = document.createElement("div")
    witch.id = "witch"
    document.body.appendChild(witch)
  }
}
