async function fetchBranch() {
  try {
    const res = await fetch('https://api.github.com/repos/Ek-StudioKAL/StickerIt/branches');
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
fetchBranch();
