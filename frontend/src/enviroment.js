let is_prod = true;

const servers = is_prod ?
    "https://conferenceworld.onrender.com" :
    "https://localhost:5713";

export default servers;