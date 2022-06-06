const Bird = artifacts.require("Flappy");


const imageURLs = [
  "https://live.staticflickr.com/65535/52123664270_02dfec075e_n.jpg",
  "https://live.staticflickr.com/65535/52123190588_5f38ed7653_b.jpg",
  "https://live.staticflickr.com/65535/52123158086_b132cb06df_z.jpg",
  "https://live.staticflickr.com/65535/52123660460_7d95c53eaf_b.jpg",
  "https://live.staticflickr.com/65535/52122129442_25771dde35_h.jpg",
  "https://live.staticflickr.com/65535/52123158041_bcc378b4a1_z.jpg"
]



module.exports = function (deployer) {
    deployer.deploy(Bird,      
    ["Classic", "Fast Yellow", "Big Blue", "Span", "Big White", "Phoenix"],       // Names
    imageURLs,
    [999999, 500, 300, 200, 100, 20],                    // HP values
    [0, 10, 20, 30, 50, 100] ,
    ["yellow-small", "yellow-fast-bird", "big-blue", "span-bird", "big-white", "phoenix"],
    ["normal" , "rare", "rare", "epic", "epic", "legendary"]
    )
  };


  