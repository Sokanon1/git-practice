
const starWarsApp = {};
	starWarsApp.endpoints = ['starships', 'vehicles', 'films', 'species', 'homeworld'], 
	starWarsApp.profiles = [],
	starWarsApp.profileAsked = 0,
	starWarsApp.questionAsked = [],
	starWarsApp.playMusic = true;

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
					// $('.gallery').slick();
				}

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

starWarsApp.userName = function(e){
	$('.userName').on('submit', function(e){
		e.preventDefault();
		const user = $('.name').val();
		$('#landing').css('display', 'none');
		$('#openingCrawl').css('display', 'block');

		starWarsApp.startAnimation();
		
		$('.crawl_text').append(`<p>It is a dark time for ${user}. Although the Death Star has been destroyed, ${user}'s longing to find true love has not waned.</p><p>Evading the dreaded Imperial Starfleet, ${user} has established a new secret base on the planet Tatooine.</p><p>There, ${user} meets three possible matches but must choose one among them before learning their true identities...</p>`);

		setTimeout ( "starWarsApp.goToGame()", 28000 );
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

	$(".sound").on("click", function() {
		$("i").toggleClass('fa-volume-up fa-volume-off');
		if($(this).hasClass('playing')) {
			audio.pause();
			$(this).removeClass('playing')
		}
		else if(starWarsApp.playMusic) {
			console.log('playing');
			audio.play();
			$(this).addClass('playing')
		}
	});
}

starWarsApp.startAnimation = function () {
	$('.title').toggleClass('starwars-demo');
	$('.text').toggleClass('crawl_text');
	$('.sound').css('visibility', 'visible');

	starWarsApp.music();

	if(starWarsApp.playMusic) {
		$('audio')[0].play();
		$('.sound').addClass('playing')
	}
}

starWarsApp.skipButton = function () {
	$('.skip').on('click', function () {
		starWarsApp.goToGame();
	});
}


starWarsApp.infoBox = function () {
	swal({
	  title: 'Instructions',
	  text: `Welcome! Inspired by the 1970s tv show 'The Dating Game', let's find out which out of three anonymous Star Wars characters you choose to go on a date with!  Pick a question from the options provided.  Then click the button "Ask Profile..." with the number of the profile you'd like to ask the question to.  When you've made your decision, click the profile card of your choice and see you who chose! May the force be with you!`,
	  imageWidth: 80,
	  imageHeight: 300,
	  imageAlt: 'Custom image',
	  animation: false
	})
}

starWarsApp.skipIntro = function () {
	$('.skipIntro').on('click', function(){
		$('#landing').fadeOut().css('display', 'none');
		$('#game').fadeIn().css('display', 'block');
		starWarsApp.infoBox();
	});
}


starWarsApp.goToGame = function () {
	$('#openingCrawl').fadeOut().css('display', 'none');
	$('#game').fadeIn().css('display', 'block');
	starWarsApp.infoBox();
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
		return "I've never flown a spaceship before."

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
	} else if (splitName.length === 2) {
		imgName = splitName[0].concat(splitName[1]);
	} else {
		imgName = splitName[0].concat(splitName[1], splitName[2]);
	}

    const img = document.createElement("img");
    img.src = `assets/characterImage/${imgName}.jpg`;

	$(`.profile${index + 1}full`).html(img).append(`<p>You chose ${name}!</p><p>${name} is from ${homeworld}.<p><p>Have fun meeting the parents! We hear ${species}s are really nice!</p>`);
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
		$(this).addClass('chosen');
		$('form').css('display', 'none');
		$('.form').css('background', 'none');
		$('.play_again').css('display', 'block');
		$(this).siblings().addClass('.not_chosen');
		$(this).siblings().css('pointer-events', 'none');

		setTimeout(starWarsApp.revealingOtherProfiles, 2000);
	});
}

starWarsApp.revealingOtherProfiles = function () {
	$('.chosen').siblings().find('.back').css('transform', 'rotateY(0)');
	$('.chosen').siblings().find('.front').css('transform', 'rotateY(-180deg)');
}

starWarsApp.startAgain = function () {
	$('.play_again').on('click', function () {
		window.location.reload();
	});
}

starWarsApp.events = function () {
	starWarsApp.getRandomProfiles();
	starWarsApp.formSubmit();
	starWarsApp.titleDisappear();
	starWarsApp.skipButton();
	starWarsApp.userName();
	starWarsApp.choosingProfile();
	starWarsApp.startAgain();
	starWarsApp.skipIntro();
}

starWarsApp.init = function() {
	starWarsApp.events();
}

$(function() {
	starWarsApp.init();
});