const nodemailer = require("nodemailer");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const dotenv = require("dotenv");
const { decode } = require("punycode");
const crypto  = require("crypto");
const fs = require("fs");
const Cryptr = require("cryptr");
const qr = require("qrcode");
const { timeEnd } = require("console");
const schedule = require('node-schedule');
const { param } = require("./routes/pages");
dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const name1 = [ "Smith",
"Brown",
"Wilson",
"Robertson",
"Campbell",
"Stewart",
"Thomson",
"Anderson",
"Scott",
"Macdonald",
"Reid",
"Murray",
"Clark",
"Taylor",
"Ross",
"Young",
"Paterson",
"Watson",
"Mitchell",
"Fraser",
"Morrison",
"Walker",
"Mcdonald",
"Graham",
"Miller",
"Johnston",
"Henderson",
"Cameron",
"Duncan",
"Gray",
"Kerr",
"Hamilton",
"Hunter",
"Davidson",
"Ferguson",
"Bell",
"Mackenzie",
"Martin",
"Simpson",
"Grant",
"Allan",
"Kelly",
"Macleod",
"Black",
"Mackay",
"Wallace",
"Mclean",
"Kennedy",
"Gibson",
"Russell",
"Marshall",
"Gordon",
"Burns",
"Stevenson",
"Milne",
"Craig",
"Wood",
"Wright",
"Munr",
"Johnstone",
"Ritchie",
"Sinclair",
"Watt",
"Mckenzie",
"Muir",
"Murphy",
"Sutherland",
"Mcmillan",
"White",
"Mckay",
"Millar",
"Hughes",
"Crawford",
"Williamson",
"Docherty",
"Maclean",
"Fleming",
"Cunningham",
"Dickson",
"Boyle",
"Douglas",
"Mcintosh",
"Bruce",
"Shaw",
"Mcgregor",
"Lindsay",
"Jamieson",
"Hay",
"Christie",
"Boyd",
"Aitken",
"Rae",
"Hill",
"Mccallum",
"Alexander",
"Mcintyre",
"Currie",
"Ramsay",
"Mackie",
"Weir",
"Jones",
"Cairns",
"Whyte",
"Mclaughlin",
"Jackson",
"Findlay",
"Forbes",
"King",
"Donaldson",
"Hutchison",
"Mcculloch",
"Mcleod",
"Mcfarlane",
"Nicol",
"Buchanan",
"Paton",
"Moore",
"Duffy",
"Reilly",
"Rennie",
"Tait",
"Irvine",
"O'Neill",
"Thompson",
"Green",
"Mcewan",
"Quinn",
"Hendry",
"Bain",
"Beattie",
"Chalmers",
"Hall",
"Hogg",
"Williams",
"Strachan",
"Turner",
"Logan",
"Cook",
"Armstrong",
"Buchan",
"Cowan",
"Gallagher",
"Barclay",
"Welsh",
"Barr",
"Gallacher",
"Gilmour",
"Murdoch",
"Blair",
"Forsyth",
"Adams",
"Cooper",
"Donnelly",
"Dick",
"Nelson",
"O'Donnell",
"Ward",
"Jack",
"Macpherson",
"Donald",
"Baird",
"Mclaren",
"Park",
"Drummond",
"Innes",
"Gillespie",
"Lawson",
"Dunn",
"Maxwell",
"Mcpherson",
"Collins",
"Spence",
"Higgins",
"Roberts",
"Duff",
"Mcgowan",
"Mcguire",
"Moffat",
"Morgan",
"Baxter",
"Macfarlane",
"Mcbride",
"Mcdougall",
"Inglis",
"Richardson",
"Stephen",
"Sharp",
"Mackinnon",
"Mcallister",
"Gillies",
"Laird",
"Rodger",
"Greig",
"Laing",
"Morton",
"Sweeney",
"Adam",
"Montgomery",
"Morris",
"Todd",
"Cassidy",
"Robb",
"Stirling",
"Webster",
"Stuart",
"Kane",
"Mckenna",
"Falconer",
"Gibb",
"Mcneill",
"Turnbull",
"Houston",
"Harvey",
"Downie",
"Cochrane",
"Little",
"Mcarthur",
"Pollock",
"Macmillan",
"Orr",
"Steele",
"Harris",
"Lynch",
"Dunlop",
"Low",
"Mcmahon",
"Nicholson",
"Allison",
"Mccann",
"Sneddon",
"Galloway",
"Carr",
"Cumming",
"Gardner",
"Cowie",
"Johnson",
"Leslie",
"Robinson",
"Forrest",
"Hardie",
"Lee",
"Milligan",
"O'Brien",
"Rankin",
"Noble",
"Knox",
"Mullen",
"Urquhart",
"Baillie",
"Harrison",
"Bennett",
"Law",
"Devine",
"Hannah",
"Moir",
"Burnett",
"Mcghee",
"Doherty",
"Macrae",
"Mccormack",
"Smart",
"Adamson",
"Gilchrist",
"Maclennan",
"Lamb",
"Malcolm",
"Clarke",
"Fisher",
"Mcgill",
"Evans",
"Geddes",
"Grieve",
"Gunn",
"Love",
"Connelly",
"Main",
"Shields",
"Calder",
"Lang",
"Nisbet",
"Wilkie",
"Coyle",
"Mair",
"Mcinnes",
"Neil",
"Pearson",
"Porter",
"Kirk",
"Carmichael",
"Livingstone",
"Macgregor",
"Patterson",
"Harper",
"Sim",
"Beaton",
"Edwards",
"Steel",
"Thomas",
"Coutts",
"Shepherd",
"Bryce",
"Mclellan",
"Phillips",
"Devlin",
"Mason",
"Caldwell",
"Dawson",
"Hart",
"Parker",
"Lamont",
"Mathieson",
"Menzies",
"Shearer",
"Gardiner",
"Cruickshank",
"Hutton",
"Davies",
"Brady",
"Gourlay",
"Henry",
"Mills",
"Petrie",
"Swan",
"Bradley",
"Doyle",
"Wylie",
"Halliday",
"Leitch",
"Mcphee",
"Archibald",
"Brodie",
"Mccormick",
"Mckinlay",
"Holmes",
"Neilson",
"Kay",
"Mccabe",
"Mclachlan",
"Dewar",
"Speirs",
"Woods",
"Connor",
"Glen",
"Hood",
"Nicolson",
"Rutherford",
"Carroll",
"Easton",
"Finlayson",
"Fitzpatrick",
"Howie",
"Reynolds",
"Fulton",
"Pirie",
"Farrell",
"Lawrie",
"Mckinnon",
"Middleton",
"Sloan",
"Melville",
"Paul",
"Rose",
"Waddell",
"Elliott",
"Irving",
"Mcdowall",
"Chisholm",
"Dow",
"Hepburn",
"Colquhoun",
"Farquhar",
"Ford",
"Kidd",
"Penman",
"Byrne",
"Lewis",
"Manson",
"Ballantyne",
"Bremner",
"Keenan",
"Cullen",
"Frew",
"Mcconnell",
"Bryson",
"Nicoll",
"Oliver",
"Chapman",
"Kirkwood",
"Mcneil",
"Callaghan",
"Crichton",
"Lees",
"Macaulay",
"Mooney",
"Davis",
"Mccafferty",
"Mccall",
"Muirhead",
"Beveridge",
"Finlay",
"Gemmell",
"Jeffrey",
"Jenkins",
"Lowe",
"Monaghan",
"Riddell",
"Curran",
"Ellis",
"Foster",
"Kemp",
"Mckechnie",
"Angus",
"Barrie",
"Edgar",
"Laidlaw",
"Skinner",
"Carson",
"Connell",
"Macinnes",
"Matheson",
"Mccoll",
"Mcmanus",
"Fowler",
"Hume",
"Daly",
"Ewing",
"Fyfe",
"Marr",
"Frame",
"Macintyre",
"Mackintosh",
"Aitchison",
"Barnes",
"Elder",
"Galbraith",
"Keith",
"Mccartney",
"Stark",
"Blyth",
"Forrester",
"Guthrie",
"Rooney",
"Small",
"Kirkpatrick",
"Connolly",
"Flynn",
"Macdougall",
"Prentice",
"Shand",
"Whitelaw",
"Wilkinson",
"Cox",
"Fletcher",
"Mcfadyen",
"Neill",
"Ogilvie",
"Rafferty",
"Thom",
"Cuthbert",
"Dunbar",
"Duthie",
"Walsh",
"Burke",
"Gow",
"Kilpatrick",
"Mcnab",
"Mcqueen",
"Peacock",
"Elliot",
"Jardine",
"Kyle",
"Shanks",
"Lyon",
"Mcdermott",
"Somerville",
"Arthur",
"Cockburn",
"Goldie",
"Meikle",
"Dickie",
"Doig",
"O'Hara",
"Barbour",
"Mccluskey",
"Roy",
"Waugh",
"Mcalpine",
"Mchugh",
"Robson",
"Borthwick",
"Fox",
"Nimmo",
"Lockhart",
"Maciver",
"Mann",
"Mcgrath",
"Meldrum",
"Allen",
"Cannon",
"Carruthers",
"Coull",
"Cuthbertson",
"Palmer",
"Semple",
"Wishart",
"Andrew",
"Balfour",
"Berry",
"Finnie",
"Malone",
"Wyllie",
"Cairney",
"Cormack",
"Gorman",
"Horne",
"Mcdade",
"Mcnicol",
"Mcphail",
"Napier",
"Pringle",
"Ramage",
"Slater",
"West",
"Binnie",
"Brand",
"Burgess",
"Mcnally",
"Moran",
"Booth",
"Deans",
"Lumsden",
"Mcguinness",
"Mckeown",
"Rodgers",
"Andrews",
"Barron",
"Dodds",
"Mcgovern",
"Mcnaughton",
"O'Connor",
"Richmond",
"Dempster",
"Garden",
"Mcclure",
"Mccreadie",
"Bowman",
"Conway",
"Crombie",
"Heron",
"Mckee",
"Mckie",
"Mclennan",
"Patrick",
"Hastie",
"Philip",
"Ryan",
"Blackwood",
"Butler",
"Drysdale",
"Gillan",
"Hope",
"Masson",
"Mccracken",
"Steven",
"Bowie",
"Ingram",
"Mcaulay",
"Templeton",
"Traynor",
"Arnott",
"Davie",
"Laurie",
"Liddell",
"Mcfadden",
"Mcleish",
"O'Rourke",
"Rice",
"Summers",
"Banks",
"Brennan",
"Gill",
"Knight",
"Pratt",
"Price",
"Yule",
"Cummings",
"Hodge",
"Mcmaster",
"Baker",
"Ewen",
"Herd",
"Holland",
"Mcauley",
"Mcguigan",
"Mclelland",
"Niven",
"Purdie",
"Bisset",
"Crossan",
"Lawrence",
"Maguire",
"Mcinally",
"Mcwilliam",
"O'Neil",
"Agnew",
"Cargill",
"Copland",
"Dempsey",
"Goodwin",
"Hamill",
"Ireland",
"James",
"Lafferty",
"Mutch",
"Barrett",
"Corbett",
"Mclauchlan",
"Newlands",
"Preston",
"Tulloch",
"Brunton",
"Dillon",
"Dixon",
"Fairbairn",
"Lennox",
"Macphee",
"Mclaughlan",
"Potter",
"Purves",
"Atkinson",
"Cross",
"Dolan",
"Duguid",
"Lyons",
"Matthews",
"Mulholland",
"Rattray",
"Dobbie",
"Mcadam",
"Mcgarry",
"Mckellar",
"Mcknight",
"Mcvey",
"Birrell",
"Carter",
"Griffin",
"Lorimer",
"Lyall",
"Mccutcheon",
"Mcginley",
"Mcrae",
"Morrice",
"Saunders",
"Smyth",
"Begg",
"Casey",
"Glass",
"Harkins",
"Harkness",
"Macarthur",
"Mcbain",
"Sharkey",
"Smillie",
"Telfer",
"Watters",
"Darroch",
"Keir",
"Mcconnachie",
"Mcquade",
"Ness",
"Thorburn",
"Will",
"Aird",
"Brooks",
"Burt",
"Erskine",
"Harley",
"Hyslop",
"Kenny",
"Madden",
"Mccue",
"Mcgee",
"Mowat",
"Nixon",
"Owens",
"Sanderson",
"Torrance",
"Valentine",
"Borland",
"Brannan",
"Brownlie",
"Clarkson",
"Couper",
"Fotheringham",
"Gilbert",
"Jarvie",
"Massie",
"Mccaig",
"Mcivor",
"Mcluckie",
"Meechan",
"O'Hare",
"Tierney",
"Wells",
"Bennie",
"Birnie",
"Boyce",
"Carlin",
"Dingwall",
"Gilfillan",
"Grierson",
"Hastings",
"Lennon",
"Mckendrick",
"Riley",
"Rogers",
"Sangster",
"Savage",
"Singh",
"Barnett",
"Fairley",
"Porteous",
"Stoddart",
"Wotherspoon",
"Brogan",
"Crosbie",
"Dougan",
"Dyer",
"Flett",
"Hislop",
"Hutcheson",
"Imrie",
"Matthew",
"May",
"Mcnaught",
"Morrow",
"Philp",
"Souter",
"Stevens",
"Strang",
"Townsley",
"Auld",
"Chambers",
"Coleman",
"Copeland",
"Farmer",
"Fullerton",
"Hynd",
"Mack",
"Myles"];
const name2 = [ "Peters",
"Raeburn",
"Samson",
"Stott",
"Struthers",
"Tough",
"Wiseman",
"Blake",
"Doran",
"Friel",
"Lambie",
"Mcnair",
"Rowan",
"Scobie",
"Scullion",
"Armour",
"Cheyne",
"Coulter",
"Dalgleish",
"Dalziel",
"Dean",
"Gauld",
"Gracie",
"Leask",
"Maclachlan",
"Michie",
"Quigley",
"Swanson",
"Syme",
"Veitch",
"Bird",
"Healy",
"Kearney",
"Leckie",
"Leith",
"Leonard",
"Livingston",
"Macgillivray",
"Mccarthy",
"Mccusker",
"Mearns",
"Meek",
"Page",
"Queen",
"Tennant",
"Walls",
"Hewitt",
"Kirkland",
"Loudon",
"Mcnulty",
"Mcshane",
"Mcwilliams",
"Melrose",
"More",
"Nairn",
"Nolan",
"Sullivan",
"Warren",
"Addison",
"Burton",
"Eadie",
"Faulds",
"Fitzsimmons",
"George",
"Haddow",
"Hanlon",
"Lamond",
"Lavery",
"Leishman",
"Maitland",
"Mccourt",
"Mcewen",
"Mcghie",
"Mckillop",
"Melvin",
"Newton",
"Ogg",
"Osborne",
"Paxton",
"Short",
"Yates",
"Adair",
"Bishop",
"Cosgrove",
"Dobson",
"Donnachie",
"Farquharson",
"Feeney",
"Ferrie",
"French",
"Gall",
"Knowles",
"Long",
"Mccubbin",
"Mclay",
"Milton",
"Nichol",
"Proctor",
"Pryde",
"Ralston",
"Stenhouse",
"Cleland",
"Darling",
"Diamond",
"Fenton",
"Ferrier",
"Gault",
"Gavin",
"Heggie",
"Mctaggart",
"Provan",
"Rendall",
"Rollo",
"Sommerville",
"Tonner",
"Corrigan",
"Dowie",
"Fairlie",
"Flanagan",
"Gaffney",
"Glover",
"Greer",
"Lambert",
"Lyle",
"Mcgoldrick",
"Moyes",
"Pettigrew",
"Shannon",
"Soutar",
"Thornton",
"Calderwood",
"Canning",
"Haggarty",
"Hendrie",
"Jordan",
"Keddie",
"Linton",
"Maccallum",
"Mccrindle",
"Mcglynn",
"Mcilroy",
"Mckinney",
"Moodie",
"Mulligan",
"Perry",
"Redpath",
"Sheridan",
"Storrie",
"Telford",
"Ali",
"Benson",
"Bryden",
"Carey",
"Clelland",
"Cowe",
"Day",
"Dunsmore",
"Girvan",
"Griffiths",
"Hopkins",
"Lynn",
"Mcclymont",
"Mcginty",
"Mcgrory",
"Mcgurk",
"Mckean",
"Taggart",
"Thain",
"Austin",
"Bonnar",
"Goodall",
"Gormley",
"Hunt",
"Kinnear",
"Logue",
"Mcandrew",
"Mcwhinnie",
"Rankine",
"Rogerson",
"Sturrock",
"Webb",
"Wight",
"Bone",
"Conroy",
"Dalrymple",
"Denholm",
"Dougall",
"Gowans",
"Hayes",
"Liddle",
"Macintosh",
"Macneil",
"Magee",
"Mcardle",
"Mcginlay",
"Mcginn",
"Mckelvie",
"Monteith",
"Shiels",
"Spalding",
"Winton",
"Burnside",
"Foley",
"Jolly",
"Joyce",
"Kilgour",
"Macphail",
"Mcconville",
"Mcgillivray",
"Mcmenemy",
"Powell",
"Spencer",
"Willox",
"Byers",
"Carswell",
"Cole",
"Coll",
"Combe",
"Crowe",
"Dunsmuir",
"Harvie",
"Jarvis",
"Kelman",
"Lauder",
"Littlejohn",
"Mcnee",
"Roxburgh",
"Tracey",
"Tweedie",
"Bathgate",
"Bissett",
"Bradford",
"Callander",
"Dryburgh",
"Elrick",
"Hudson",
"Kean",
"Mcmullan",
"Mcmurdo",
"Mcmurray",
"Owen",
"Proudfoot",
"Renton",
"Suttie",
"Trotter",
"Barton",
"Beck",
"Bolton",
"Bulloch",
"Cooke",
"Cruickshanks",
"Fagan",
"Fernie",
"Flockhart",
"Hodgson",
"Kinnaird",
"Maclellan",
"Mallon",
"Mccarron",
"Mccrae",
"Mcvicar",
"Munn",
"Payne",
"Peden",
"Pritchard",
"Renwick",
"Slaven",
"Strain",
"Bailey",
"Callan",
"Craigie",
"Dale",
"Dundas",
"Finnigan",
"Gerrard",
"Gibbons",
"Glennie",
"Goodfellow",
"Hadden",
"Horsburgh",
"Hutchinson",
"Macaskill",
"Masterton",
"Mcdaid",
"Mcrobbie",
"Mercer",
"Norris",
"Nugent",
"Peat",
"Steedman",
"Travers",
"Wyper",
"Ball",
"Bryan",
"Cherry",
"Clements",
"Dallas",
"Fairgrieve",
"Glendinning",
"Govan",
"Haining",
"Lloyd",
"Lowrie",
"Mcgibbon",
"Mchardy",
"Mcniven",
"Milroy",
"Newman",
"Reekie",
"Skene",
"Stone",
"Toner",
"Troup",
"Wales",
"Wardrop",
"Archer",
"Barker",
"Batchelor",
"Bates",
"Buist",
"Crighton",
"Delaney",
"Drennan",
"English",
"Gillon",
"Harrower",
"Honeyman",
"Horn",
"Howard",
"Irwin",
"Lister",
"Mather",
"Mcclelland",
"Mccolm",
"Mcfadzean",
"Mcnamee",
"Mcsherry",
"Molloy",
"Mullan",
"Sands",
"Spiers",
"Stanley",
"Stein",
"Waters",
"Bannerman",
"Broadley",
"Cant",
"Carnegie",
"Colvin",
"Cuthill",
"Donachie",
"Fordyce",
"Glancy",
"Goudie",
"Haig",
"Haldane",
"Heaney",
"Hussain",
"Jennings",
"Leiper",
"Lochrie",
"Logie",
"Maclaren",
"Mcavoy",
"Mcdonagh",
"Redmond",
"Riach",
"Smellie",
"Tosh",
"Ure",
"Walton",
"Whiteford",
"Bonner",
"Briggs",
"Carrick",
"Clubb",
"Collie",
"Conner",
"Cooney",
"Dey",
"Dobie",
"Donaghy",
"Drever",
"Duffin",
"Dykes",
"Emslie",
"Ewart",
"Freeman",
"Grubb",
"Lothian",
"Macnab",
"Mccrorie",
"Mcilwraith",
"Moss",
"Muldoon",
"Naismith",
"Richards",
"Scrimgeour",
"Stafford",
"Tomlinson",
"Trainer",
"Wardlaw",
"Weston",
"Allardyce",
"Bayne",
"Blackley",
"Braid",
"Breen",
"Breslin",
"Conn",
"Edmond",
"Firth",
"Gold",
"Gould",
"Gregory",
"Guild",
"Haggart",
"Haggerty",
"Hetherington",
"Howat",
"Hutcheon",
"Learmonth",
"Lennie",
"Lonie",
"Marsh",
"Mathers",
"Mciver",
"Mclintock",
"Mcminn",
"Peebles",
"Stokes",
"Wightman",
"Yeats",
"Yuill",
"Blackburn",
"Bonar",
"Brough",
"Colville",
"Craik",
"Cranston",
"Dryden",
"Fairweather",
"Fergusson",
"Ferns",
"Herbert",
"Kelso",
"Letham",
"Mcateer",
"Mcnamara",
"Mcquillan",
"Mcwhirter",
"Mellon",
"Methven",
"Nicholls",
"O'Reilly",
"Oliphant",
"Pender",
"Power",
"Ronald",
"Sharpe",
"Sibbald",
"Sykes",
"Traill",
"Warnock",
"Willis",
"Arbuckle",
"Barry",
"Blackie",
"Buckley",
"Butchart",
"Carnie",
"Carty",
"Cavanagh",
"Chan",
"Comrie",
"Cree",
"Deas",
"Divers",
"Donoghue",
"Downs",
"Fallon",
"Ferris",
"Foy",
"Francis",
"Greenan",
"Gribben",
"Hair",
"Hosie",
"Kaur",
"Langlands",
"Lightbody",
"Mcdiarmid",
"Parry",
"Pattison",
"Penny",
"Sandison",
"Sime",
"Stephenson",
"Toal",
"Watkins",
"Welch",
"Wheeler",
"Whitehead",
"Whitton",
"Ahmed",
"Bertram",
"Best",
"Bowes",
"Broadfoot",
"Brock",
"Catto",
"Collier",
"Crozier",
"Daniel",
"Dodd",
"Ewan",
"Ferry",
"Garrett",
"Greenwood",
"Hoey",
"Hoggan",
"Kent",
"Kerrigan",
"Laverty",
"Leighton",
"Lochhead",
"Louden",
"Luke",
"Mccready",
"Mcdermid",
"Mcgarrigle",
"Mcgeachy",
"Mchale",
"Mcmullen",
"Moar",
"Mulgrew",
"Notman",
"Parsons",
"Pennycook",
"Pert",
"Polson",
"Rosie",
"Sandilands",
"Seaton",
"Snedden",
"Tod",
"Tolmie",
"Vaughan",
"Wade",
"Wark",
"Warrender",
"Westwood",
"Winter",
"Wong",
"Akhtar",
"Bartlett",
"Blue",
"Bridges",
"Brownlee",
"Burrows",
"Cassells",
"Coyne",
"Dalgarno",
"Esslemont",
"Garrity",
"Godfrey",
"Hainey",
"Haughey",
"Holt",
"Mccombie",
"Mcdowell",
"Mctavish",
"Mcveigh",
"Neish",
"O'Kane",
"Oswald",
"Pearce",
"Poole",
"Potts",
"Rodden",
"Scobbie",
"Sherry",
"Stirton",
"Twaddle",
"Winning",
"Winters",
"Youngson",
"Arnold",
"Bateman",
"Benzie",
"Blain",
"Bradshaw",
"Brydon",
"Budge",
"Cain",
"Carberry",
"Carlyle",
"Cartwright",
"Clayton",
"Costello",
"Courtney",
"Creighton",
"Duffus",
"Dunne",
"Eccles",
"Fitzgerald",
"Frost",
"Greene",
"Guy",
"Hancock",
"Hare",
"Herron",
"Hillhouse",
"Hogarth",
"Kinghorn",
"Lacey",
"Lucas",
"Malloy",
"Mcbeth",
"Mccaffrey",
"Mcclung",
"Mccluskie",
"Mccolgan",
"Mckinley",
"Mckirdy",
"Mclatchie",
"Mcmurtrie",
"Nash",
"Norman",
"Norrie",
"Pate",
"Patton",
"Primrose",
"Rees",
"Ronaldson",
"Sanders",
"Shedden",
"Stronach",
"Sturgeon",
"Symington",
"Vallance",
"Wemyss",
"Abbott",
"Aikman",
"Ainslie",
"Berwick",
"Bingham",
"Bond",
"Brockie",
"Burr",
"Burrell",
"Caulfield",
"Charles",
"Clifford",
"Coventry",
"Crawley",
"Curtis",
"Dailly",
"Doolan",
"Edmiston",
"Egan",
"Flannigan",
"Flood",
"Forman",
"Fortune",
"Greenshields",
"Grier",
"Halley",
"Harding",
"Hartley",
"Howieson",
"Lapsley",
"Larkin",
"Longmuir",
"Macfadyen",
"Macritchie",
"Macvicar",
"Mcaleer",
"Mcgavin",
"Mcglashan",
"Mcglone",
"Mcgonigle",
"Mcmichael",
"Mcsorley",
"Neville",
"O'Malley",
"Peddie",
"Picken",
"Pickering",
"Purdon",
"Ratcliffe",
"Reed",
"Scally",
"Simmons",
"Skelton",
"Stalker",
"Sutton",
"Tucker",
"Whelan",
"Amos",
"Ballantine",
"Barber",
"Barrowman",
"Beedie",
"Bernard",
"Birse",
"Boland",
"Bryceland",
"Bunyan",
"Carrie",
"Carrigan",
"Coghill",
"Cordiner",
"Dudgeon",
"Dunnett",
"Easson",
"Edward",
"Fenwick",
"Gay",
"Gilmartin",
"Gorrie",
"Gough",
"Hammond",
"Howden",
"Howe",
"Ironside",
"Maccoll",
"Macneill",
"Masterson",
"Mccarroll",
"Mccrone",
"Mcgraw",
"Mcnicoll",
"Mcroberts",
"Meiklejohn",
"Moncur",
"Moody",
"Mortimer",
"Newall",
"Patience",
"Plenderleith",
"Pow",
"Regan",
"Rowe",
"Sawers",
"Schofield",
"Scoular",
"Wynne",
"Younger",
"Abercrombie" ];
const name3 = [ "Blaikie",
"Britton",
"Chrystal",
"Clinton",
"Cochran",
"Craw",
"Curley",
"Dougal",
"Field",
"Florence",
"Fyffe",
"Galt",
"Gaughan",
"Glasgow",
"Good",
"Grady",
"Grainger",
"Heeps",
"Holden",
"Hughson",
"Jess",
"Kinloch",
"Macqueen",
"Macsween",
"Maley",
"Mccallion",
"Mccauley",
"Mccleary",
"Mccrory",
"Mcelhinney",
"Mcgarvey",
"Mclarty",
"Mcmenamin",
"Mcpake",
"Mcskimming",
"Mill",
"Mohammed",
"Mullin",
"Murison",
"Peterson",
"Purvis",
"Ralph",
"Sandford",
"Scotland",
"Sellar",
"Shankland",
"Vance",
"Wardrope",
"Wills",
"Airlie",
"Bennet",
"Boag",
"Bray",
"Caird",
"Canavan",
"Convery",
"Corr",
"Croll",
"Dall",
"Don",
"Dowds",
"Findlater",
"Forster",
"Fullarton",
"Garvie",
"Gebbie",
"Heath",
"Hegarty",
"Humphrey",
"Keane",
"Keay",
"Lappin",
"Lovie",
"Mabon",
"Mackin",
"Maloney",
"Mcalister",
"Mcburnie",
"Mcgarrity",
"Mcgarva",
"Mcgaw",
"Mckendry",
"Mcleman",
"Mcrobert",
"Mcturk",
"Middlemass",
"O'Hagan",
"O'Sullivan",
"Ogston",
"Ormiston",
"Pagan",
"Paris",
"Platt",
"Purcell",
"Quin",
"Renfrew",
"Rhind",
"Rintoul",
"Robbie",
"Rowley",
"Rush",
"Samuel",
"Smail",
"Smeaton",
"Stables",
"Symon",
"Tocher",
"Trail",
"Waterston",
"Westwater",
"Allardice",
"Annand",
"Anthony",
"Bauld",
"Brebner",
"Brotherston",
"Burgoyne",
"Carlton",
"Cassie",
"Clapperton",
"Cleary",
"Clement",
"Clunie",
"Coats",
"Coia",
"Cusick",
"Dalton",
"Daniels",
"Dornan",
"Duggan",
"Duncanson",
"Durie",
"Eaton",
"Eddie",
"Fergus",
"Gilroy",
"Girdwood",
"Grigor",
"Halkett",
"Hampton",
"Hanley",
"Hannigan",
"Hawthorn",
"Hicks",
"Hooper",
"Humphreys",
"Husband",
"Inkster",
"Jaffray",
"Joss",
"Keegan",
"Keogh",
"Khan",
"Kiernan",
"Latto",
"Leggate",
"Mactaggart",
"Mcindoe",
"Mcleary",
"Mcphillips",
"Moncrieff",
"Perkins",
"Pollard",
"Reith",
"Rigby",
"Roger",
"Salmond",
"Service",
"Skilling",
"Slavin",
"Spowart",
"Stirrat",
"Storie",
"Temple",
"Tully",
"Wason",
"Arnot",
"Asher",
"Barlow",
"Blacklock",
"Boyes",
"Braidwood",
"Brisbane",
"Browne",
"Buick",
"Cattanach",
"Charlton",
"Close",
"Corcoran",
"Crooks",
"Devaney",
"Drain",
"Earl",
"Faichney",
"Fiddes",
"Gellatly",
"Gifford",
"Gillen",
"Greenhill",
"Hanratty",
"Hawkins",
"Haxton",
"Hillis",
"Hossack",
"Hoy",
"Kavanagh",
"Keating",
"Kydd",
"Lammie",
"Latimer",
"Lundie",
"Mackellar",
"Mathewson",
"Mccreath",
"Mcfall",
"Mcgroarty",
"Meehan",
"Mowatt",
"Mowbray",
"Neave",
"Newbigging",
"Newell",
"O'Hanlon",
"Parkinson",
"Perrie",
"Pirrie",
"Plunkett",
"Prior",
"Read",
"Rhodes",
"Riddoch",
"Roe",
"Rourke",
"Runciman",
"Sandeman",
"Stanton",
"Steen",
"Still",
"Strathearn",
"Sword",
"Thorpe",
"Vallely",
"Vickers",
"Walters",
"Warwick",
"Whitfield",
"Whittaker",
"Woodburn",
"Adie",
"Ahmad",
"Alston",
"Atkins",
"Balloch",
"Beckett",
"Bowden",
"Bowen",
"Brannigan",
"Breckenridge",
"Brett",
"Brewster",
"Butcher",
"Cadger",
"Calvert",
"Cardno",
"Carle",
"Carse",
"Cathcart",
"Caven",
"Clegg",
"Cleghorn",
"Clyde",
"Cocker",
"Colligan",
"Condie",
"Deeney",
"Dennison",
"Donohoe",
"Dorrian",
"Dougherty",
"Dowling",
"Duke",
"Esson",
"Etherson",
"Everett",
"Fair",
"Ferries",
"France",
"Fuller",
"Gilliland",
"Given",
"Greenhorn",
"Harkin",
"Hyde",
"Keen",
"Kenney",
"Kettles",
"Kirkham",
"Lane",
"Laurenson",
"Leadbetter",
"Leggat",
"Linden",
"Lithgow",
"Mahon",
"Mains",
"Mcausland",
"Mccloy",
"Mcdonnell",
"Mcevoy",
"Mcharg",
"Mchattie",
"Mcloughlin",
"Mcneilly",
"Mennie",
"Millen",
"Minto",
"Morison",
"Mustard",
"Norton",
"Pottinger",
"Raeside",
"Reeves",
"Ridley",
"Rossi",
"Ruddy",
"Sillars",
"Skea",
"Storey",
"Strickland",
"Talbot",
"Third",
"Townsend",
"Vass",
"Warden",
"Weatherston",
"Whalen",
"Withers",
"Woodcock",
"Alcorn",
"Armit",
"Bald",
"Balmer",
"Begley",
"Bentley",
"Boath",
"Boswell",
"Boylan",
"Browning",
"Burden",
"Busby",
"Caldow",
"Cassels",
"Chung",
"Cobb",
"Colgan",
"Conaghan",
"Conlon",
"Connon",
"Craib",
"Cruden",
"Dearie",
"Deighan",
"Derrick",
"Dickinson",
"Dunsire",
"Durkin",
"Durno",
"Fearon",
"Foote",
"Foubister",
"Frater",
"Fry",
"Fyvie",
"Gamble",
"Gannon",
"Garrow",
"Grogan",
"Hand",
"Hanna",
"Hargreaves",
"Harrold",
"Hassan",
"Hiddleston",
"Hirst",
"Hobson",
"Hogan",
"Hook",
"Horton",
"Hotchkiss",
"Inch",
"Kincaid",
"Kinniburgh",
"Lilley",
"Liston",
"Llewellyn",
"Lobban",
"Lockie",
"Lynas",
"Macbeth",
"Macdiarmid",
"Mailer",
"Maule",
"Mcaleese",
"Mcaloon",
"Mcbeath",
"Mcblain",
"Mccardle",
"Mcclintock",
"Mccord",
"Mcelroy",
"Mcgarvie",
"Mcgeoch",
"Mcgeough",
"Mcgivern",
"Mckain",
"Mcmonagle",
"Mcneish",
"Mcphie",
"Mcritchie",
"Mcvie",
"Meighan",
"Metcalfe",
"Michael",
"Miles",
"Mollison",
"Moreland",
"Mulheron",
"Murchie",
"Naylor",
"North",
"Pattullo",
"Pyper",
"Shek",
"Shirley",
"Singer",
"Snaddon",
"Speed",
"Sproul",
"Strong",
"Swinton",
"Tainsh",
"Timmons",
"Topping",
"Tsang",
"Underwood",
"Waldron",
"Warner",
"Watterson",
"Whitson",
"Wiggins",
"Wilkins",
"Abernethy",
"Affleck",
"Aitkenhead",
"Aiton",
"Ashton",
"Auchterlonie",
"Bethune",
"Bett",
"Bibi",
"Bilsland",
"Birch",
"Blackhall",
"Brash",
"Cairnie",
"Carney",
"Carpenter",
"Castle",
"Colston",
"Conlin",
"Cossar",
"Crerar",
"Crookston",
"Crossley",
"Deacon",
"Doogan",
"Dorward",
"Doull",
"Dyce",
"Eaglesham",
"Espie",
"Eunson",
"Fettes",
"Finn",
"Gair",
"Gentles",
"Gerrie",
"Gibbs",
"Granger",
"Greenlaw",
"Greenlees",
"Groat",
"Guyan",
"Hale",
"Hannan",
"Harcus",
"Harte",
"Hobbs",
"Hollywood",
"Hourston",
"Howatson",
"Humphries",
"Hyland",
"Judge",
"Kellas",
"Kilday",
"Locke",
"Lowden",
"Macadam",
"Mactavish",
"Malcolmson",
"Malley",
"Malloch",
"Mcara",
"Mcbrearty",
"Mccaffery",
"Mcclafferty",
"Mcclurg",
"Mccowan",
"Mcgeachie",
"Mcgilvray",
"Mcginness",
"Mcglade",
"Mcgougan",
"Mcgreevy",
"Mcnairn",
"Mcneillie",
"Mcquarrie",
"Mcsporran",
"Merry",
"Mungall",
"Naughton",
"Nutt",
"O'Connell",
"Oag",
"Oakes",
"Pike",
"Pryce",
"Pullar",
"Rainey",
"Ray",
"Rettie",
"Roddie",
"Seath",
"Seivwright",
"Seymour",
"Sheppard",
"Speedie",
"Stephens",
"Stitt",
"Stubbs",
"Tasker",
"Thow",
"Toland",
"Tudhope",
"Turley",
"Venters",
"Wann",
"Watts",
"Wighton",
"Winchester",
"Ballingall",
"Beech",
"Beggs",
"Berrie",
"Biggar",
"Blackstock",
"Blades",
"Blaney",
"Bogle",
"Bow",
"Brackenridge",
"Brechin",
"Bright",
"Brolly",
"Cadden",
"Cahill",
"Carstairs",
"Cathro",
"Chamberlain",
"Church",
"Cobban",
"Coburn",
"Corson",
"Cowper",
"Crane",
"Cull",
"Dalling",
"Davey",
"Davison",
"Degnan",
"Denham",
"Denny",
"Deuchars",
"Dobbin",
"Donnan",
"Dorans",
"Dowell",
"Durham",
"Fell",
"Foreman",
"Forgie",
"Fowlie",
"Garry",
"Getty",
"Gibbon",
"Giles",
"Goodman",
"Gove",
"Grace",
"Grimes",
"Grimley",
"Gunning",
"Hagan",
"Halcrow",
"Halpin",
"Hayward",
"Hemphill",
"Herdman",
"Herkes",
"Hinshelwood",
"Ho",
"Holliday",
"Hopper",
"Houghton",
"Howell",
"Hurst",
"Hynes",
"Kenyon",
"Kirby",
"Lavelle",
"Lessels",
"Lunn",
"Macbeath",
"Maccormick",
"Macmaster",
"Macnaughton",
"Macquarrie",
"Maher",
"Maver",
"Mcalinden",
"Mccaughey",
"Mccrossan",
"Mcelwee",
"Mcgeown",
"Mcgonigal",
"Mcguffie",
"Mcinulty",
"Mckernan",
"Mcrobb",
"Mcseveney",
"Merchant",
"Moonie",
"Mouat",
"Mudie",
"Mundell",
"Norwood",
"Panton",
"Percival",
"Peter",
"Pitt",
"Pope",
"Pugh",
"Raffan",
"Rocks",
"Scorgie",
"Sergeant",
"Shewan",
"Snodgrass",
"Starrs",
"Stratton",
"Tate",
"Tervit",
"Thoms",
"Tinney",
"Torbet",
"Trainor",
"Tyson",
"Waite",
"Wardle",
"Weaver",
"Wingate",
"Yeaman",
"Armitage",
"Ashcroft",
"Atherton",
"Beresford",
"Biggins",
"Blacklaw",
"Blues",
"Bryant",
"Burn",
"Carnochan",
"Catterson",
"Christison",
"Clancy",
"Coates",
"Coffey",
"Cowley",
"Cramb",
"Crilly",
"Crook",
"Cushnie",
"Deary",
"Doris",
"Drew",
"Dunnachie",
"Dyet",
"Easdale",
"Edmonds",
"Fawcett",
"Flaherty",
"Freeland",
"Garland",
"Gartland",
"Gladstone",
"Goodwillie",
"Grandison",
"Gribbin",
"Groves",
"Haley",
"Hannay",
"Hawthorne",
"Heenan",
"Herriot",
"Hind",
"Howitt",
"Jaffrey",
"Jessiman",
"Junor",
"Kaye",
"Keatings",
"Keeney",
"Keiller",
"Killin",
"Killoh",
"Kirkaldy",
"Langan",
"Langford",
"Lannigan",
"Latta",
"Lauchlan",
"Lawless",
"Leach",
"Leary",
"Ledingham",
"Lemon",
"Linn",
"Macallister",
"Maceachen" ];
const name4 = [ "Macisaac",
"Macnair",
"Massey",
"Matchett",
"Mathie",
"Mcconachie",
"Mccool",
"Mccraw",
"Mcgilp",
"Mcginnis",
"Mcgown",
"Mcgrattan",
"Mcisaac",
"Mckeever",
"Mckim",
"Mcmartin",
"Mcmeekin",
"Mcvean",
"Mellis",
"Middler",
"Millan",
"Moon",
"Murchison",
"Murrie",
"Myers",
"O'Byrne",
"Ovens",
"Pattie",
"Peattie",
"Phee",
"Phinn",
"Pinkerton",
"Pithie",
"Plank",
"Radcliffe",
"Raitt",
"Rolland",
"Rough",
"Ruthven",
"Sadler",
"Sayers",
"Scouller",
"Selfridge",
"Sellars",
"Sherriff",
"Sherriffs",
"Shirra",
"Skelly",
"Slessor",
"Sloss",
"Sorley",
"Spark",
"Spink",
"Stillie",
"Stobie",
"Street",
"Terris",
"Terry",
"Timmins",
"Tollan",
"Torrie",
"Towns",
"Usher",
"Weldon",
"Whitefield",
"Whiteside",
"Yardley",
".",
"Abel",
"Abraham",
"Aiken",
"Aldridge",
"Ashe",
"Baldwin",
"Bannatyne",
"Baptie",
"Batty",
"Beatson",
"Begbie",
"Bews",
"Blackmore",
"Blakey",
"Bolland",
"Bower",
"Brawley",
"Brittain",
"Buntin",
"Candlish",
"Carruth",
"Cherrie",
"Coles",
"Colman",
"Colthart",
"Corner",
"Croft",
"Cromar",
"Crow",
"D'Arcy",
"Daisley",
"Denoon",
"Devenney",
"Diack",
"Dods",
"Dooley",
"Doonan",
"Dorman",
"Eden",
"Fee",
"Fern",
"Finney",
"Fleck",
"Garner",
"Gartshore",
"Garven",
"Gatherer",
"Gaw",
"Gear",
"Gibney",
"Gilbertson",
"Gilhooley",
"Gillie",
"Gilligan",
"Gilmore",
"Glencross",
"Goodlet",
"Greenfield",
"Grindlay",
"Hackett",
"Hailstones",
"Halbert",
"Hampson",
"Hansen",
"Hardy",
"Haston",
"Hawkes",
"Herbertson",
"Howarth",
"Kelbie",
"Killen",
"Larkins",
"Laughlin",
"Lind",
"Lovell",
"Lowson",
"Loy",
"Lunan",
"Lyttle",
"Macalister",
"Mackechnie",
"Markey",
"Marrs",
"Mcalindon",
"Mcauslan",
"Mcauslane",
"Mccarter",
"Mccaw",
"Mccrimmon",
"Mcculley",
"Mcgeechan",
"Mcgeorge",
"Mcgiffen",
"Mcgirr",
"Mcglinchey",
"Mcgonagle",
"Mcgugan",
"Mcluskey",
"Mcmeechan",
"Mcvittie",
"Mead",
"Middlemiss",
"Milloy",
"Money",
"Morrin",
"Murie",
"Naysmith",
"Neal",
"Neilly",
"Nicholl",
"O'Shea",
"Paisley",
"Parkes",
"Parkin",
"Parr",
"Pattinson",
"Peggie",
"Pelosi",
"Pennington",
"Phillip",
"Phimister",
"Piper",
"Priest",
"Robin",
"Rundell",
"Rushford",
"Sampson",
"Scollay",
"Seatter",
"Selkirk",
"Senior",
"Shirkie",
"Sinton",
"Sivewright",
"Snell",
"Sorbie",
"Stanners",
"Straiton",
"Tannahill",
"Tannock",
"Tarbet",
"Tawse",
"Tighe",
"Timoney",
"Tobin",
"Tyrrell",
"Walkinshaw",
"Waterson",
"Weddell",
"Wilcox",
"Wilkes",
"Wyatt",
"Younie",
"Smith",
"Brown",
"Wilson",
"Campbell",
"Thomson",
"Robertson",
"Stewart",
"Anderson",
"Scott",
"Macdonald",
"Murray",
"Reid",
"Clark",
"Taylor",
"Ross",
"Young",
"Paterson",
"Watson",
"Walker",
"Henderson",
"Morrison",
"Mitchell",
"Mcdonald",
"Fraser",
"Graham",
"Duncan",
"Miller",
"Kerr",
"Hamilton",
"Gray",
"Davidson",
"Martin",
"Cameron",
"Johnston",
"Simpson",
"Bell",
"Hunter",
"Allan",
"Grant",
"Ferguson",
"Mackenzie",
"Mclean",
"Kelly",
"Black",
"Macleod",
"Mackay",
"Kennedy",
"Gibson",
"Russell",
"Sutherland",
"Wallace",
"Craig",
"Marshall",
"Gordon",
"Watt",
"Munro",
"Milne",
"Sinclair",
"Mckenzie",
"Burns",
"Stevenson",
"Johnstone",
"Millar",
"Murphy",
"Hughes",
"Ritchie",
"Muir",
"White",
"Wright",
"Mcmillan",
"Cunningham",
"Crawford",
"Williamson",
"Wood",
"Mckay",
"Docherty",
"Douglas",
"Mcintosh",
"Bruce",
"Boyle",
"Fleming",
"Mcgregor",
"Christie",
"Dickson",
"Shaw",
"Mclaughlin",
"Alexander",
"Aitken",
"Currie",
"Maclean",
"King",
"Jamieson",
"Lindsay",
"Forbes",
"Mcintyre",
"Whyte",
"Hay",
"Donaldson",
"Mcleod",
"Findlay",
"Jones",
"Rae",
"Mcfarlane",
"Mackie",
"Mcculloch",
"Cairns",
"O'Neill",
"Mccallum",
"Reilly",
"Jackson",
"Boyd",
"Thompson",
"Hill",
"Blair",
"Buchanan",
"Hall",
"Paton",
"Donnelly",
"Weir",
"Chalmers",
"Cook",
"Irvine",
"Adams",
"Hutchison",
"Tait",
"O'Donnell",
"Duffy",
"Armstrong",
"Beattie",
"Moore",
"Nicol",
"Bain",
"Forsyth",
"Rennie",
"Cowan",
"Mclaren",
"Williams",
"Gallacher",
"Mcewan",
"Dunn",
"Mcgowan",
"Ramsay",
"Buchan",
"Gallagher",
"Ward",
"Cooper",
"Laing",
"Logan",
"Nelson",
"Hendry",
"Hogg",
"Quinn",
"Murdoch",
"Gilmour",
"Turner",
"Baird",
"Collins",
"Kane",
"Lawson",
"Welsh",
"Green",
"Richardson",
"Stephen",
"Mcguire",
"Spence",
"Drummond",
"Barclay",
"Mcdougall",
"Jack",
"Turnbull",
"Dick",
"Maxwell",
"Strachan",
"Mccann",
"Donald",
"Sharp",
"Higgins",
"Gillespie",
"Greig",
"Robinson",
"Moffat",
"Dunlop",
"Macfarlane",
"Little",
"Mckenna",
"Morgan",
"Sneddon",
"Barr",
"Baxter",
"Mcarthur",
"Orr",
"Houston",
"Macpherson",
"Sweeney",
"Innes",
"Mcbride",
"Webster",
"Gillies",
"Duff",
"Gibb",
"Burnett",
"Mackinnon",
"Cassidy",
"Fisher",
"Montgomery",
"Park",
"Cochrane",
"Inglis",
"Morton",
"Stuart",
"Law",
"Mcpherson",
"Lynch",
"Mcghee",
"Morris",
"Bennett",
"Harris",
"Leslie",
"Robb",
"Forrest",
"Mcallister",
"Allison",
"Cumming",
"Rodger",
"Hannah",
"Mcgill",
"Todd",
"Harvey",
"Roberts",
"Adam",
"Rankin",
"Galloway",
"Harrison",
"Gardiner",
"Harper",
"Clarke",
"Downie",
"Laird",
"Milligan",
"Johnson",
"Mcinnes",
"Neilson",
"Baillie",
"Mason",
"Main",
"Mcmahon",
"Doherty",
"Bradley",
"O'Brien",
"Patterson",
"Smart",
"Wilkie",
"Connelly",
"Hardie",
"Shields",
"Pollock",
"Cowie",
"Cruickshank",
"Gilchrist",
"Mcneil",
"Mcneill",
"Dawson",
"Sim",
"Kirk",
"Mooney",
"Stirling",
"Geddes",
"Mccabe",
"Mckinnon",
"Fulton",
"Macmillan",
"Brady",
"Evans",
"Petrie",
"Low",
"Macgregor",
"Noble",
"Coyle",
"Lee",
"Davies",
"Falconer",
"Mullen",
"Steele",
"Gardner",
"Lang",
"Lawrie",
"Malcolm",
"Connor",
"Shearer",
"Urquhart",
"Carroll",
"Devlin",
"Dewar",
"Edwards",
"Ford",
"Love",
"Mccormack",
"Parker",
"Wylie",
"Phillips",
"Calder",
"Knox",
"Gunn",
"Hepburn",
"Shepherd",
"Hart",
"Mair",
"Nicholson",
"Moir",
"Pearson",
"Bremner",
"Mcphee",
"Nisbet",
"Carr",
"Livingstone",
"Mccormick",
"Steel",
"Neil",
"Porter",
"Thomas",
"Henry",
"Manson",
"Reynolds",
"Keenan",
"Mclachlan",
"Adamson",
"Dunbar",
"Howie",
"Caldwell",
"Macrae",
"Waddell",
"Maclennan",
"Nicoll",
"Hood",
"Leitch",
"Swan",
"Kay",
"Lamb",
"Menzies",
"Mills",
"Nicolson",
"Rutherford",
"Halliday",
"Kidd",
"Lamont",
"Mclellan",
"Sloan",
"Beaton",
"Carmichael",
"Hutton",
"Mcdowall",
"Beveridge",
"Mathieson",
"Paul",
"Chisholm",
"Matheson",
"Mccafferty",
"Mann",
"Elliott",
"Woods",
"Bryce",
"Chapman",
"Fyfe",
"Oliver",
"Pirie",
"Brodie",
"Davis",
"Devine",
"Elder",
"Connolly",
"Farrell",
"Finlayson",
"Foster",
"Hume",
"Jardine",
"Ballantyne",
"Flynn",
"Guthrie",
"Jenkins",
"Lewis",
"Mccoll",
"Muirhead",
"Coutts",
"Mcfadyen",
"Bryson",
"Curran",
"Edgar",
"Macintyre",
"Rooney",
"Arthur",
"Carson",
"Doyle",
"Grieve",
"Holmes",
"Kirkwood",
"Andrew",
"Easton",
"Gourlay",
"Macaulay",
"Mackintosh",
"Lees",
"Mcqueen",
"Skinner",
"Archibald",
"Carruthers",
"Crichton",
"Mcdermott",
"Mcmanus",
"Mcnab",
"Fitzpatrick",
"Lyon",
"Mccall",
"Melville",
"Middleton",
"O'Hara",
"Penman",
"Rodgers",
"Stark",
"Farquhar",
"Mcconnell",
"Mckechnie",
"Speirs",
"Ogilvie",
"Connell",
"Cullen",
"Fox",
"O'Connor",
"Angus",
"Barrie",
"Burke",
"Monaghan",
"Small",
"Byrne",
"Cockburn",
"Galbraith",
"Keith",
"Rose",
"Thom",
"Cox",
"Gemmell",
"Lowe",
"Mckinlay",
"Steven",
"Callaghan",
"Finlay",
"Gill",
"Horne",
"Patrick",
"Aitchison",
"Daly",
"Glen",
"Lockhart",
"Meikle",
"Berry",
"Frew",
"Macdougall",
"Andrews",
"Elliot",
"Goldie",
"Jeffrey",
"Maciver",
"Mckee",
"Roy",
"Summers",
"Dow",
"Drysdale",
"Ellis",
"Bowman",
"Conway",
"Davie",
"Irving",
"Blyth",
"Cormack",
"Deans",
"Dolan",
"Mcguinness",
"Moran",
"Dodds",
"Mccartney",
"Whitelaw",
"Dickie",
"Rice",
"Brand",
"Fletcher",
"Frame",
"Kilpatrick",
"Shand",
"Somerville",
"West",
"Wilkinson",
"Brennan",
"Colquhoun",
"Ewing",
"Mcnally",
"Niven",
"Pringle",
"Agnew",
"Banks",
"Borthwick",
"Corbett",
"Duthie",
"Mckeown",
"Neill",
"Walsh",
"Waugh",
"Armour",
"Cannon",
"Cummings",
"Fowler",
"Kirkpatrick",
"Kyle",
"Ryan",
"Allen",
"Kemp",
"Marr",
"Mcnaughton",
"Mcwilliam",
"Potter",
"Riddell",
"Robson",
"Singh",
"Bowie",
"Liddell",
"Maguire",
"Mccreadie",
"Mulholland",
"Nimmo",
"Philip",
"Hastie"
];

// const candidate_names = ["Ferdinand Romualdez Marcos Jr.", "Maria Leonor Santo Tomas Gerona", "Francisco Moreno Domagoso", "Emmanuel Dapidran Pacquiao","Ferdinand Romualdez Marcos Jr.", "Maria Leonor Santo Tomas Gerona", "Francisco Moreno Domagoso", "Emmanuel Dapidran Pacquiao", "Ferdinand Romualdez Marcos Jr.", "Maria Leonor Santo Tomas Gerona"]
// const candidate_ids = ["1", "2", "3", "4", "1", "2", "3", "4", "1", "2" ];
// const position = "President";
// const vote = "1";


// db.query('SELECT * FROM tbl_users ', async (error, users) => {
// db.query('SELECT * FROM rsa_sample ', async (error, ecdsa) => {
//     // 
//     const enc_sec = process.env.ENC_SECRET;
//     const pbkdf2Iterations = parseInt(process.env.pbkdf2Iterations);
//     const cryptr = new Cryptr(enc_sec, pbkdf2Iterations);
    
//     for (i=2; i < ecdsa.length; i++) {

//         const startLooping = new Date();
//         const sLoop = startLooping.getMilliseconds();

//     var status;
//     const user_id = users[i].id;
//     const privateKey = ecdsa[i].private_key;
//     const publicKey = ecdsa[i].public_key;

//     // random selection of candidate name & ID
//     let code_x = Math.floor(Math.random() * 10);
//     const candidate_name = candidate_names[code_x];
//     const candidate_id = candidate_ids[code_x];

//     // encrypted
//     const enc_user_id = cryptr.encrypt(user_id);
//     const enc_id = cryptr.encrypt(candidate_id);
//     const enc_position = cryptr.encrypt(position);
//     const enc_candidate_name = cryptr.encrypt(candidate_name);
//     const enc_vote = cryptr.encrypt(vote);

//     const payload =  {
//         user_id: enc_user_id,
//         candidate_id: enc_id,
//         position: enc_position,
//         candidate_name: enc_candidate_name,
//         vote: enc_vote
//     };

//     const signature = jwt.sign(payload, privateKey, {
//     algorithm: 'RS256',
//     });


//     // console.log();
//     // console.log(signature);
//     // console.log();

//     jwt.verify(signature, publicKey, {algorithm: ['RS256']}, function(err, decoded) {
//         if(err) {
//           status = "Invalid";
  
//         }
//         else {
          
//           if (decoded !== undefined) {
//             status = "Valid";
//           }
//           else
//           {
//             status = "Invalid";
//           }
//         }
//         const endLooping = new Date();
//         const eLoop = endLooping.getMilliseconds();
//         const totaltime = (endLooping-startLooping);
  
//         db.query('INSERT INTO tbl_sample_voting_rsa SET ?', { hash:signature, user_id:user_id, candidate_id: candidate_id, position:position, candidate_name: enc_candidate_name, vote:vote, status:status, time: totaltime }, (err, results) => {

//         });
  
//         // console.log(signature);
//         console.log("No. "+user_id+" Done... Status: "+ status);

        
//       });

   

//     }


// });
// });

  db.query('SELECT SUM(time) as sumtime FROM tbl_sample_voting_rsa', async (error, sum) => {
    db.query('SELECT AVG(time) as avgtime FROM tbl_sample_voting_rsa', async (error, avg) => {
    const totaltime = sum[0].sumtime;
    const avgtime = avg[0].avgtime;
    console.log();
    console.log();
    console.log("RSA Validation of Signature");
    console.log();
    console.log("Total time: "+totaltime+" ms");
    console.log("Average time: "+avgtime+" ms");
    console.log();
    });
  });