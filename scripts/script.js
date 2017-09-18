const starWarsApp = {};
	starWarsApp.endpoints = ['starships', 'vehicles', 'films', 'species', 'homeworld'], 
	starWarsApp.profiles = [],
	starWarsApp.profileAsked = 0,
	starWarsApp.questionAsked = [],

starWarsApp.getPeople = function (number){
	$.ajax({
		url: 'http://proxy.hackeryou.com',
		dataType: 'json',
		method:'GET',
		data: {
			reqUrl: `https://swapi.co/api/people/${number}`,
			xmlToJSON: false
		}
	}).then((person) => {
		
		const allEndpoints = [];
		for (let i = 0; i < starWarsApp.endpoints.length; i++){
			const endpoint = starWarsApp.endpoints[i];
			allEndpoints.push(starWarsApp.getSubsequentCharacterInformation(person, endpoint));
		};

		Promise.all(allEndpoints)
			.then(function(allResults) {

				person.endpoint = allResults[0]

				allResults.forEach(function(result, i) {
					person[starWarsApp.endpoints[i]] = result;
				});
				
				starWarsApp.profiles.push(person);

				if (starWarsApp.profiles.length === 3) {
					starWarsApp.profiles.forEach(starWarsApp.profileOnPage)
				}
				console.log(starWarsApp.profiles);

			});
	}).fail(function(err){
		alert("The Force is not with this page! Let us refresh this page for you.")
		 window.location.reload(); 
	});
}

starWarsApp.getSubsequentCharacterInformation = function(person, endpoint) {
	let results = [];
	let prop = person[endpoint];

	prop = typeof prop === 'string' ? [prop]: prop;

	let requests = [];
	return new Promise(function(resolve, reject) {
			requests = prop.map(function(url){
				return $.ajax({
						url: 'http://proxy.hackeryou.com',
						dataType: 'json',
						method:'GET',
						data: {
							reqUrl: url,
							xmlToJSON: false
						}
					});
			});
		$.when(...requests)
			.then(function(...promiseResults) {

				if (promiseResults.length === 0) {

				} else if (Array.isArray(promiseResults[0])) {
					results = promiseResults.map(function(promise) {
						return promise[0];
					});

				} else if (typeof promiseResults === "object") {
					results.push(promiseResults[0]);

				}
				resolve(results);
			});
	});
}

starWarsApp.getRandomProfiles = function() {
	// for loop to call 3 random 'people' profiles
	for (let r = 0; r < 3; r++) {
		randomNumber = Math.floor(Math.random() * 88) + 1;
		starWarsApp.getPeople(randomNumber);
	}
}

// Landing Page and Opening Crawl

// attempted to make the below work but couldn't thus the reason for the hard code in the html
starWarsApp.userName = function(e){
	$('.userName').on('submit', function(e){
		e.preventDefault();
		const user = $('.name').val();
		$('#landing').css('display', 'none');
		$('#openingCrawl').css('display', 'block');

		starWarsApp.startAnimation();
		
		$('.crawl_text').append(`<p>It is a dark time for ${user}. Although the Death Star has been destroyed, ${user}'s longing to find true love has not waned.</p><p>Evading the dreaded Imperial Starfleet, ${user} has established a new secret base on the remote ice world of Hoth.</p><p>There, ${user} meets three possible matches but must choose one among them before learning their true identities....</p>`);

		starWarsApp.music();
	});
}

starWarsApp.titleDisappear = function(){
	function hideTitle() {
		$('.starwars-demo').fadeOut();
	}
	setTimeout(hideTitle, 9500);
}

starWarsApp.music = function () {
	const audio = document.getElementById('themeMusic');
	$(audio).get(0).play();
	audio.muted = false;

	$(".sound").on("click", function() {
		$("i").toggleClass('fa-volume-up fa-volume-off');

		if (audio.muted === true){
			audio.muted = false;
		} else if(audio.muted === false){
			audio.muted = true;
		}
	});
}

starWarsApp.startAnimation = function () {
	$('.title').toggleClass('starwars-demo');
	$('.text').toggleClass('crawl_text');
}

starWarsApp.skipButton = function () {
	$('.skip').on('click', function () {
		$('#openingCrawl').css('display', 'none');
		$('#game').css('display', 'block');
	});

}

starWarsApp.homeworld = function(homeworld) {
	if (typeof homeworld === 'object'){
		if(homeworld.name === "unknown") {
			return "a mysterious point of origin";
		} 
		return homeworld.name

	} else if(homeworld === "unknown") {
		return "a mysterious point of origin";
	}	
}

starWarsApp.species = function(species) {
	if (species.length === 0){
		return "their family member";

	} else {
		return species[0].name;
	}
}


starWarsApp.starships = function(starships) {
	if (starships.length === 0) {
		return "I've never driven a spaceship before."

	} else if (starships.length >= 1) {
		const shipList = starships.map(starship => {
			return starship.name
		}).join(" , ");
		return `I've flown a ${shipList}.`
	}
}

starWarsApp.films =function (films) {
	if (films.length >= 1){
		const filmList = films.map(films => {
			return films.title
		}).join(" , ");
		return `You might have seen me in ${filmList} perhaps?`
	}
}

starWarsApp.profileOnPage = function (item, index) {
	const name = item.name;
	const homeworld = starWarsApp.homeworld(item.homeworld[0]);
	const species = starWarsApp.species(item.species);
	const starships = starWarsApp.starships(item.starships);
	const splitName = name.split(" ");
	let imgName = " ";
	
	if (splitName.length === 1) {
		imgName = splitName[0];
	} else {
		imgName = splitName[0].concat(splitName[1]);
	}

    const img = document.createElement("img");
    img.src = `assets/characterImage/${imgName}.jpg`;

	$(`.profile${index + 1}full`).html(img).append(`<p>You chose ${name}!</p><p>${name} is from ${homeworld}.<p><p>Have fun meeting their parents! We hear ${species}s are really nice!</p>`);
}

starWarsApp.formSubmit = function (e) {
	$('select').on('change', function(){
		starWarsApp.questionAsked = $(this).val();
		$('input').attr('disabled', false);
	});

	$('input').on('click', function(){
		const profile = $(this).data("index");
		if (profile === 0){
			starWarsApp.profileAsked = 0;
		} else if (profile === 1){
			starWarsApp.profileAsked = 1;
		} else if (profile === 2){
			starWarsApp.profileAsked = 2;
		}

	});

	$('form').on('submit', function(e){
		e.preventDefault();
		const indexNumber = starWarsApp.profileAsked;
		const questionAsked = starWarsApp.questionAsked;
		const property = starWarsApp.profiles[indexNumber][questionAsked]
		const clickedButton = $(`input[type="submit"][value="${indexNumber +1}"]`);
		const starships = starWarsApp.starships(starWarsApp.profiles[indexNumber].starships);
		const homeworld = starWarsApp.homeworld(starWarsApp.profiles[indexNumber].homeworld[0]);
		const films = starWarsApp.films(starWarsApp.profiles[indexNumber].films);

		if ($('select option:selected').val() === "eye_color"){
			$(`.profile${indexNumber + 1}answers`).append(`<p> My eyes are ${property}. </p>`);

		} else if ($('select option:selected').val() === "height"){
			// from aladin8848 on Stack Overflow
			function toFeet(n) {
			      var realFeet = ((n*0.393700) / 12);
			      var feet = Math.floor(realFeet);
			      var inches = Math.round((realFeet - feet) * 12);
			      return feet + "&prime;" + inches + '&Prime;';
			    }
			$(`.profile${indexNumber + 1}answers`).append(`<p> I'm ${property}cm / ${toFeet(property)} feet tall. </p>`);

		} else if ($('select option:selected').val() === "starships"){
			$(`.profile${indexNumber + 1}answers`).append(`<p> ${starships} </p>`);

		} else if ($('select option:selected').val() === "homeworld"){
			$(`.profile${indexNumber + 1}answers`).append(`<p> My home planet is ${homeworld}. </p>`);

		} else if ($('select option:selected').val() === "films"){
			$(`.profile${indexNumber + 1}answers`).append(`<p>${films}</p>`);
		}

		$(clickedButton).attr('disabled', true);

	});
}

starWarsApp.choosingProfile = function () {
	$('.profile').on('click', function () {
		$(this).find('.back').css('transform', 'rotateY(0)');
		$(this).find('.front').css('transform', 'rotateY(-180deg)');
	});
}

starWarsApp.events = function () {
	starWarsApp.getRandomProfiles();
	starWarsApp.formSubmit();
	starWarsApp.titleDisappear();
	starWarsApp.skipButton();
	starWarsApp.userName();
	starWarsApp.choosingProfile();
}

starWarsApp.init = function() {
	starWarsApp.events();
}

$(function() {
	starWarsApp.init();
});