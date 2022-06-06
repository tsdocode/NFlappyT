// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


import "./libraries/Base64.sol";

contract Flappy is ERC721 {

  // Helper Function
  function compareStrings(string memory a, string memory b) public view returns (bool) {
    return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
  }

  // Auto-increment for unique token ids.
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;



  // Eth transcation handler
  receive() external payable {
    emit Paid(msg.sender, msg.value);
  }

  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function withdraw() public {
    payable(msg.sender).transfer(address(this).balance);
  }

  

  // Data structure
  struct BirdAttributes {
    uint birdIndex;
    string name;
    string imageURI;        
    uint stamina;
    uint maxStamina;
    uint bonus;
    string sprite;
    string rare;
    bool isSelled;
  }



  // Array of birds
  BirdAttributes[] defaultCharacters;

  constructor(
    string[] memory birdNames,
    string[] memory birdImageURIs,
    uint[] memory birdStamina,
    uint[] memory birdBonus,
    string[] memory sprites,
    string[] memory rare
  )
    ERC721("Flappy", "FLAP")
  {
    // Loop through all the characters, and save their values in our contract so
    // we can use them later when we mint our NFTs.
    for(uint i = 0; i < birdNames.length; i += 1) {
      defaultCharacters.push(BirdAttributes({
        birdIndex: i,
        name: birdNames[i],
        imageURI: birdImageURIs[i],
        stamina: birdStamina[i],
        maxStamina : birdStamina[i],
        bonus: birdBonus[i],
        sprite: sprites[i],
        rare: rare[i],
        isSelled: false
      }));

    }
    _tokenIds.increment();
  }


  // Get the bird attributes by id
  mapping(uint256 => BirdAttributes) public nftHolderAttributes;


  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    BirdAttributes memory charAttributes = nftHolderAttributes[_tokenId];

    string memory strStamina = Strings.toString(charAttributes.stamina);
    string memory strMaxStamina = Strings.toString(charAttributes.maxStamina);
    string memory strBonus= Strings.toString(charAttributes.bonus);


    string memory json = Base64.encode(
      abi.encodePacked(
        '{"name": "',
        charAttributes.name,
        ' -- NFT #: ',
        Strings.toString(_tokenId),
        '", "description": "This is an NFT that lets people play in the game Flappy Bird", "image": "',
        charAttributes.imageURI,
        '", "attributes": [ { "trait_type": "Stamina", "value": ',strStamina,', "Max Stamina":',strMaxStamina,
        '}, { "display_type": "boost_percentage", "trait_type": "Bonus", "value": ',
        strBonus,'}, { "trait_type": "Spirte", "value": "' ,charAttributes.sprite, '"},',
        '{ "trait_type": "Rare", "value": "' ,charAttributes.rare, '"}'
        ,'] }'
      )
    );

    string memory output = string(
      abi.encodePacked("data:application/json;base64,", json)
    );
    
    return output;
  }

  function mintCharacterNFT(uint _characterIndex) public  {
    // Get current tokenId (starts at 1 since we incremented in the constructor).
    uint256 newItemId = _tokenIds.current();

    // The magical function! Assigns the tokenId to the caller's wallet address.
    _safeMint(msg.sender, newItemId);

    // We map the tokenId => their character attributes. More on this in
    // the lesson below.
    nftHolderAttributes[newItemId] = BirdAttributes({
      birdIndex: newItemId,
      name: defaultCharacters[_characterIndex].name,
      imageURI: defaultCharacters[_characterIndex].imageURI,
      stamina: defaultCharacters[_characterIndex].stamina,
      maxStamina: defaultCharacters[_characterIndex].maxStamina,
      bonus: defaultCharacters[_characterIndex].bonus,
      sprite: defaultCharacters[_characterIndex].sprite,
      rare: defaultCharacters[_characterIndex].rare,
      isSelled: defaultCharacters[_characterIndex].isSelled
    });


    // Increment the tokenId for the next person that uses it.
    _tokenIds.increment();
  }


  function checkIfUserHasNFT(address player) public view returns (BirdAttributes[] memory) {
    // Get the tokenId of the user's character NFT
    uint256 numberOfToken = balanceOf(player);

    BirdAttributes[] memory birdAttributes = new BirdAttributes[](numberOfToken);

    uint tokenID = 1;
    uint tokenCount = 0;

    while (tokenCount < numberOfToken) {
      if (nftHolderAttributes[tokenID].isSelled == false) {
        birdAttributes[tokenCount] = nftHolderAttributes[tokenID];
        tokenCount += 1;
      }
      tokenID += 1;
    }

    return birdAttributes;
  }



  // Event
  event Paid(address indexed _from, uint _value);
  event GameReward(address indexed _player, uint _ether);

  // Game function
  function gameComplete(uint score, uint birdIndex) public returns (uint) {
    require(ownerOf(birdIndex) == msg.sender);

    address payable player_ = payable(msg.sender);
    BirdAttributes storage bird_ = nftHolderAttributes[birdIndex];
    uint bonus = bird_.bonus;



    uint256 reward = 1087000000000000 + score * 100000000000000 wei;
    reward = reward + reward / 100 * bonus;

    player_.transfer(reward);

    bird_.stamina = bird_.stamina - 1;

    emit GameReward(player_, reward);
    return reward;
  }


  // Luckydraw Helper

  function randomRare(uint random_number) public view returns (string memory){
    uint random = random_number;
    string[4] memory rare = ["normal", "rare", "epic", "legendary"];
    uint[4] memory rareProbability = [uint256(50), uint256(80),uint256(95),uint256(100)];

    random = random % uint8(100);

    uint index;

    for (int i = 0; i < 4; i++) {
      if (random < rareProbability[uint256(i)]) {
        index = uint256(i);
        break;
      }
    }

    return rare[index];
  }

  function getBirdByRare(string memory rare, uint random_number) public view returns (BirdAttributes memory) {
    BirdAttributes[] memory temp = new BirdAttributes[](10);
    uint index = 0;

    for (uint i = 0; i < defaultCharacters.length; i++) {
      if (compareStrings(defaultCharacters[i].rare,  rare)) {
        temp[index] = defaultCharacters[i];
        index += 1;
      }
    }

    return temp[random_number % index];
  }

  function luckyDraw(uint random_number) payable public returns (uint) {
    require(checkIfUserHasNFT(msg.sender).length <= 5, "You can only have upto 6 NFTs");
    string memory rare = randomRare(random_number);
    BirdAttributes memory bird = getBirdByRare(rare, random_number);
    mintCharacterNFT(bird.birdIndex);
    return bird.birdIndex;
  }

  // Sell token for shop
  function sellForShop(uint tokenId) public payable returns (uint){
    require(ownerOf(tokenId) == msg.sender, "You are not the owner of this token");
    address payable player_ = payable(msg.sender);

    uint256 reward = 1122360 + 1000000 gwei;
    player_.transfer(reward);

    nftHolderAttributes[tokenId].isSelled = true;
    _burn(tokenId);
  }
}




