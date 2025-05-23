function main() {
	/* register GSAP */
	gsap.registerPlugin(SplitText, ScrollTrigger, Flip);

	/* set breakpoints */
	tyx.breakpoints = {
		dsk: 992,
		tab: 768,
		mbl: 480,
	};

	/* set splide defaults */
	(function () {
		Splide.defaults = {
			perMove: 1,
			gap: "0rem",
			arrows: false,
			pagination: false,
			focus: 0,
			speed: 600,
			dragAngleThreshold: 60,
			autoWidth: false,
			rewind: false,
			rewindSpeed: 400,
			waitForTransition: false,
			updateOnMove: true,
			trimSpace: "move",
			type: "loop",
			drag: true,
			snap: true,
			autoWidth: false,
			autoplay: true,
		};
	})();

	tyx.functions.randomText = function () {
		let mm = gsap.matchMedia();

		// only do this on desktop
		mm.add("(min-width: 767px)", () => {
			document.querySelectorAll(".text-anim-random").forEach((el) => {
				// Split text into char spans
				const split = new SplitText(el, { types: "words, chars" });
				// Ensure visibility
				gsap.set(el, { opacity: 1 });

				// Timeline plays on enter, reverses on leave back, and reverts splits on complete or reverse complete
				const tl = gsap.timeline({
					paused: true,
					onComplete: () => split.revert(),
					onReverseComplete: () => split.revert(),
				});

				tl.from(split.chars, {
					opacity: 0,
					duration: 0.05,
					ease: "power1.out",
					stagger: { amount: 0.4, from: "random" },
				});

				// Scroll-triggered playback
				ScrollTrigger.create({
					trigger: el,
					start: "top 90%",
					onEnter: () => tl.play(),
				});
				ScrollTrigger.create({
					trigger: el,
					start: "top bottom",
					// onLeaveBack: () => tl.reverse()
				});
			});

			return () => {};
		});
	};
	tyx.functions.homeHero = function () {
		const mediaElem = document.querySelector(".home-hero_media-wrap");
		const scrollTargetDsk = document.querySelector(".scroll-target-dsk");
		const sizeTargetDsk = document.querySelector(".size-target-dsk");
		if (!mediaElem || !scrollTargetDsk) {
			console.error("[Hero Animation] Missing required elements.");
			return;
		}

		const mm = gsap.matchMedia();
		let heroTL, heroTrigger;

		// DESKTOP CONTEXT
		mm.add(`(min-width: ${tyx.breakpoints.tab}px)`, () => {
			// kill any old instance for this hero
			if (heroTrigger) heroTrigger.kill();
			if (heroTL) heroTL.kill();

			const windowWidth = window.innerWidth;
			const desiredWidth = sizeTargetDsk.offsetWidth;
			const scaleFactor = windowWidth >= desiredWidth ? desiredWidth / windowWidth : 0.5;
			const transformOriginX = (scrollTargetDsk.offsetLeft / windowWidth) * 100;

			gsap.set(mediaElem, { transformOrigin: `${transformOriginX}% 50%` });

			// build timeline and keep refs
			heroTL = gsap
				.timeline({
					scrollTrigger: {
						trigger: ".s-home-hero",
						start: "top top",
						end: "center center",
						endTrigger: scrollTargetDsk,
						scrub: true,
						pin: mediaElem,
						pinSpacing: true,
						onUpdate(self) {
							if (self.progress === 1) {
								gsap.set(mediaElem, {
									position: "relative",
									top: "auto",
									left: "auto",
									xPercent: 0,
									yPercent: 0,
								});
							}
						},
						onLeaveBack() {
							gsap.set(mediaElem, {
								clearProps: "position,top,left,xPercent,yPercent,transformOrigin",
							});
						},
						// capture the trigger instance
						onToggle(self, isActive) {
							heroTrigger = self;
						},
					},
				})
				.to(mediaElem, { scale: scaleFactor, left: 0, ease: "power2.out" })
				.to(
					[".home-hero_content", ".home-hero_video-overlay"],
					{ opacity: 0, ease: "power2.out" },
					"<"
				);

			// return cleanup for when desktop un-matches
			return () => {
				heroTrigger && heroTrigger.kill();
				heroTL && heroTL.kill();
				gsap.set(mediaElem, { clearProps: "all" });
			};
		});

		// MOBILE CONTEXT: cleanup only our hero
		mm.add(`(max-width: ${tyx.breakpoints.tab - 1}px)`, () => {
			heroTrigger && heroTrigger.kill();
			heroTL && heroTL.kill();
			gsap.set(mediaElem, { clearProps: "all" });
			// no teardown return needed
		});
	};

	tyx.functions.largeSlider = function () {
		// Get all swiper containers
		const components = document.querySelectorAll(".large-slider");
		if (!components.length) return;

		components.forEach((component) => {
			const swiperEl = component.querySelector(".swiper");
			if (!swiperEl) return;

			// Get the swiper-wrapper within the current container
			const swiperWrapper = component.querySelector(".swiper-wrapper");
			if (!swiperWrapper) return;

			// Get all swiper-slide elements within the current container
			const swiperSlides = component.querySelectorAll(".swiper-slide");
			if (!swiperSlides.length) return;

			// Clone each swiper-slide element 4 times and append to the swiper-wrapper
			for (let i = 0; i < 4; i++) {
				swiperSlides.forEach((slide) => {
					const clone = slide.cloneNode(true);
					swiperWrapper.appendChild(clone);
				});
			}

			const swiper = new Swiper(swiperEl, {
				centeredSlides: true,
				slideToClickedSlide: true /* click on slide to scroll to it */,
				slidesPerView: 1,
				autoplay: {
					delay: 5000,
				},
				navigation: {
					nextEl: ".splide__arrow.splide__arrow--next",
					prevEl: ".splide__arrow.splide__arrow--prev",
				},
				loop: true,
				loopAdditionalSlides: 5 /* render more slides */,
				freeMode: {
					/* allow 'flick scrolling */ enabled: true,
					sticky: true /* snap to slides */,
					minimumVelocity: 0.05,
					momentumVelocityRatio: 0.1,
					momentumRatio: 0.5 /* dial it down a little */,
				},
				effect: "creative" /* enable scaling effect */,
				creativeEffect: {
					limitProgress: 2,
					prev: {
						// Slide scale
						scale: 0.85,
						translate: ["-100%", 0, 0],
						origin: "right center",
						opacity: 0.75,
					},
					next: {
						// Slide scale
						scale: 0.85,
						translate: ["100%", 0, 0],
						origin: "left center",
						opacity: 0.75,
					},
				},
				keyboard: {
					enabled: true,
					onlyInViewport: false,
				},
				on: {
					sliderFirstMove: function () {
						// console.log("sliderFirstMove");
						const activeSlide = this.slides[this.activeIndex];
						const prevSlide = this.slides[this.activeIndex - 1];
						const nextSlide = this.slides[this.activeIndex + 1];
						[activeSlide, prevSlide, nextSlide].forEach((slide) => {
							const video = slide.querySelector("video");
							if (video) {
								video.loop = true;
								video.play();
							}
						});
					},
					afterInit: function () {
						// console.log("Swiper initialised");

						const activeSlide = this.slides[this.activeIndex];
						const video = activeSlide.querySelector("video");
						if (video) {
							video.loop = true;
							video.play();
						}
					},
					transitionEnd: function () {
						// console.log("transitionEnd");
						const activeSlide = this.slides[this.activeIndex];

						this.slides.forEach((slideElement) => {
							const video = slideElement.querySelector("video");
							if (slideElement === activeSlide) {
								if (video) {
									video.loop = true;
									video.play();
								}
							} else {
								if (video) {
									video.pause();
								}
							}
						});
					},
				},
			});
		});
	};

	tyx.functions.benefits = function () {
		var check = document.querySelector(".benefit-card");
		if (!check) return;

		let mm = gsap.matchMedia();

		mm.add("(min-width: 768px)", () => {
			let items = gsap.utils.toArray(".benefits_list"); // get all the lists of benefit cards

			items.forEach((container, i) => {
				const section = document.querySelector(".s-benefits");
				if (!section) return;

				let localItems = container.querySelectorAll(".benefit-card"),
					distance = () => {
						let lastItemBounds = localItems[localItems.length - 1].getBoundingClientRect(),
							containerBounds = container.getBoundingClientRect();
						return Math.max(0, lastItemBounds.right - containerBounds.right);
					};
				gsap.to(container, {
					x: () => -distance(), // make sure it dynamically calculates things so that it adjusts to resizes
					ease: "none",
					scrollTrigger: {
						trigger: container,
						start: "center center",
						pinnedContainer: section,
						end: () => "+=" + distance(),
						pin: section,
						scrub: true,
						invalidateOnRefresh: true, // will recalculate any function-based tween values on resize/refresh (making it responsive)
					},
				});
			});

			return () => {
				gsap.set(items, { clearProps: "x" });
			};
		});

		mm.add("(max-width: 767px)", () => {
			if (!splide) {
				var splide = new Splide(".s-benefits .splide", {
					type: "slide",
					mediaQuery: "min",
					autoplay: false,
					autoWidth: true,
					arrows: false,
					trimSpace: "move",
					pagination: false,
					breakpoints: {
						768: {
							destroy: true,
						},
					},
				});

				splide.mount();
			}

			return () => {
				if (splide) {
					splide.destroy();
					splide = null;
				}
			};
		});
	};

	tyx.functions.magicCarousel = function () {
		var check = document.querySelector(".s-magic-carousel .splide");
		if (!check) return;

		var splide = new Splide(".s-magic-carousel .splide", {
			type: "slide",
			mediaQuery: "min",
			autoWidth: true,
			autoplay: false,
			arrows: true,
			trimSpace: "move",
			pagination: false,
		});

		var bar = splide.root.querySelector(".progress_bar");
		var prevArrow = splide.root.querySelector(".splide__arrow--prev");
		var nextArrow = splide.root.querySelector(".splide__arrow--next");

		splide.on("mounted move", function () {
			// Progress bar logic
			if (bar) {
				var end = splide.Components.Controller.getEnd() + 1;
				var rate = Math.min((splide.index + 1) / end, 1);
				bar.style.width = String(100 * rate) + "%";
			}

			// Arrow disable logic
			if (prevArrow) {
				if (splide.index === 0) {
					prevArrow.classList.add("is-inactive");
				} else {
					prevArrow.classList.remove("is-inactive");
				}
			}

			if (nextArrow) {
				if (splide.index === splide.Components.Controller.getEnd()) {
					nextArrow.classList.add("is-inactive");
				} else {
					nextArrow.classList.remove("is-inactive");
				}
			}
		});

		splide.mount();
	};

	tyx.functions.counter = function () {
		// create a custom effect for the counter
		gsap.registerEffect({
			name: "counter",
			extendTimeline: true,
			defaults: {
				end: 0,
				duration: 0.5,
				ease: "power1",
				increment: 1,
			},
			effect: (targets, config) => {
				let tl = gsap.timeline();
				let num = targets[0].innerText.replace(/\,/g, "");
				targets[0].innerText = num;

				tl.to(
					targets,
					{
						duration: config.duration,
						innerText: config.end,
						//snap:{innerText:config.increment},
						modifiers: {
							innerText: function (innerText) {
								return gsap.utils
									.snap(config.increment, innerText)
									.toString()
									.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
							},
						},
						ease: config.ease,
					},
					0
				);

				return tl;
			},
		});

		gsap.set(".stat", { opacity: 0, y: 20 });

		ScrollTrigger.batch(".stat", {
			// how early before entering should the trigger fire
			start: "top 80%",
			// max items to animate at once
			batchMax: 5,
			// small delay window to group items
			interval: 0.1,

			onEnter(batch) {
				batch.forEach((stat, i) => {
					const counterEl = stat.querySelector(".anim-count");
					if (!counterEl) return;

					const end = parseInt(counterEl.dataset.endValue, 10) || 0;
					const inc = parseInt(counterEl.dataset.increment, 10) || 1;
					const dur = parseFloat(counterEl.dataset.duration) || 1;

					// reset for A11y
					counterEl.innerText = "0";
					counterEl.setAttribute("aria-live", "polite");
					counterEl.setAttribute("role", "status");

					// build a little timeline for this stat:
					gsap
						.timeline({
							delay: i * 0.15, // match your fade-stagger
						})
						// 1) fade it in
						.to(stat, {
							opacity: 1,
							y: 0,
							duration: 0.2,
							ease: "power1.out",
						})
						// 2) once that's done, fire your counter
						.call(() => {
							gsap.effects.counter(counterEl, {
								end,
								increment: inc,
								duration: dur,
							});
						});
				});
			},
			once: true, // Ensure animation happens only once
		});
	};
	tyx.functions.changeIntroColors = function () {
		if (!document.querySelector(".s-home-intro")) return;
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: ".s-home-intro",
				start: "bottom 60%",
				// end: "bottom-=400 top",
				toggleActions: "play none none reverse",
			},
			defaults: {
				duration: 1,
				ease: "power1.inOut",
			},
		});
		tl.to(
			[".s-home-intro .section-bg-neg", ".s-home-stats", ".s-magic-carousel"],
			{
				backgroundColor: "var(--_color---grey--dark-2)",
				"--_theme---body": "white",
				"--_theme---link": "var(--_color---blue--mid)",
				"--_theme---link-hover": "var(--_color---purple--mid)",
			},
			0
		);
		// tl.to(
		// 	[".s-home-intro .label, .s-home-stats .label"],
		// 	{
		// 		color: "white",
		// 	},
		// 	0
		// );
	};
	tyx.functions.playVideosOnHover = function () {
		const triggers = document.querySelectorAll(".video-hover-trigger");
		triggers.forEach((trigger) => {
			const video = trigger.querySelector("video");
			if (!video) return;

			var isPlaying = false;

			if (tyx.lazyLoadVideos) {
				const [dataSrc, videoSource] = tyx.helperFunctions.getVideoDataSrc(video);
				if (!dataSrc) return;

				// generate the poster URL for the video
				const posterURL = tyx.helperFunctions.generatePosterURL(video, dataSrc);
				video.setAttribute("poster", posterURL);

				// generate the video URL for the video
				const videoURL = tyx.helperFunctions.generateVideoURL(video, dataSrc);
				videoSource.setAttribute("src", videoURL);
			} else {
				tyx.helperFunctions.simpleVideoLoad(video);
			}

			video.onplaying = function () {
				isPlaying = true;
				// console.log("change to playing");
			};
			video.onpause = function () {
				isPlaying = false;
				// console.log("change to pause");
			};
			trigger.addEventListener("mouseenter", function () {
				playVid(video, isPlaying);
			});
			trigger.addEventListener("mouseleave", function () {
				pauseVid(video, isPlaying);
			});
		});

		// Play video function
		async function playVid(video, isPlaying) {
			if (video.paused && !isPlaying) {
				// console.log("play");
				return video.play();
			}
		}

		// Pause video function
		function pauseVid(video, isPlaying) {
			if (!video.paused && isPlaying) {
				// console.log("pause");
				video.pause();
			}
		}
	};

	tyx.functions.magicCard = function () {
		const cards = document.querySelectorAll(".magic-card");
		const className = "w-variant-c5bd8cb1-745d-6422-4579-86188fba0502";

		function toggleClass(els, myClass) {
			els.forEach((el) => {
				if (el.classList.contains(myClass)) {
					el.classList.remove(myClass);
				} else {
					el.classList.add(myClass);
				}
			});
		}

		cards.forEach((card) => {
			const btn = card.querySelector(".magic-card_btn");
			const content = card.querySelector(".magic-card_content");
			const content_1 = card.querySelector(".magic-card_content-1");
			const content_2 = card.querySelector(".magic-card_content-2");
			const content_3 = card.querySelector(".magic-card_content-3");
			if (!btn || !content) return;

			// const tl = gsap.timeline({
			// 	paused: true,
			// });

			function doFlip() {
				const state = Flip.getState([card, content, content_1, content_2, content_3]);

				// make styling change
				toggleClass([card, content, content_1, content_2, content_3], className);

				Flip.from(state, { duration: 1, ease: "power1.inOut" });

				card.setAttribute("aria-expanded", "true");
			}

			btn.addEventListener("click", function () {
				if (card.getAttribute("aria-expanded") !== "true") {
					doFlip();
				} else {
					// Reset the card to its original state
					toggleClass([card, content, content_1, content_2, content_3], className);
					card.setAttribute("aria-expanded", "false");
				}
			});
		});
	};

	tyx.functions.serviceCard = function () {
		var check = document.querySelector(".home-service-card");
		if (!check) return;

		let mm = gsap.matchMedia();

		mm.add("(min-width: 768px)", () => {
			const cards = document.querySelectorAll(".home-service-card");
			cards.forEach((card) => {
				const bottom = card.querySelector(".home-service-card_bottom");
				let tl = gsap.timeline({
					paused: true,
					reversed: true,
				});
				tl.to(bottom, { height: "auto", duration: 0.3 });
				gsap.set(bottom, { height: 0 });

				card.addEventListener("mouseenter", function () {
					toggle();
				});
				card.addEventListener("mouseleave", function () {
					toggle();
				});

				function toggle() {
					tl.reversed() ? tl.play() : tl.reverse();
				}
			});

			return () => {
				// reset height
				gsap.set(".home-service-card_bottom", { height: "auto" });
			};
		});

		var splide = new Splide(".s-home-services .splide", {
			type: "slide",
			mediaQuery: "min",
			// autoWidth: true,
			//width: "16rem",
			autoplay: false,
			arrows: true,
			trimSpace: "move",
			pagination: false,
			breakpoints: {
				768: {
					destroy: true,
				},
			},
		});
		var bar = splide.root.querySelector(".progress_bar");
		if (!bar) {
			splide.mount();
			return;
		} else {
			// Updates the bar width whenever the carousel moves:
			splide.on("mounted move", function () {
				var end = splide.Components.Controller.getEnd() + 1;
				var rate = Math.min((splide.index + 1) / end, 1);
				bar.style.width = String(100 * rate) + "%";
			});
			splide.mount();
		}
	};

	tyx.functions.teamSlider = function () {
		var check = document.querySelector(".s-team .splide");
		if (!check) return;
		var splide = new Splide(".s-team .splide", {
			type: "loop",
			autoplay: false,
			autoScroll: {
				speed: 1,
				pauseOnHover: false,
			},
			clones: 5,
			arrows: false,
			trimSpace: "move",
			pagination: false,
			snap: false,
			drag: "free",
		});

		splide.mount(window.splide.Extensions);
	};

	tyx.functions.testimonials = function () {
		var check = document.querySelector(".s-testimonials .splide");
		if (!check) return;

		var splide = new Splide(".s-testimonials .splide", {
			type: "loop",
			autoplay: false,
			autoScroll: {
				speed: 1,
				pauseOnHover: false,
			},
			arrows: false,
			trimSpace: "move",
			pagination: false,
		});

		splide.mount(window.splide.Extensions);
	};

	tyx.functions.chaosMarquee = function () {
		// duplicate marquee content element
		const marqueeContent = document.querySelector(".chaos-marquee_content");
		if (!marqueeContent) return;
		const marqueeContentClone = marqueeContent.cloneNode(true);
		marqueeContent.parentNode.appendChild(marqueeContentClone);
	};

	tyx.functions.process = function () {
		const sections = document.querySelectorAll(".s-process");
		if (!sections) return;

		sections.forEach((section) => {
			const steps = section.querySelectorAll(".process-step");
			if (!steps) return;

			// Set initial state
			gsap.set(steps, { yPercent: 100, autoAlpha: 0 });

			// Create a timeline for the animation
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: section,
					start: "top 60%",
					end: "bottom 80%",
					scrub: 1,
					once: true,
				},
			});

			tl.to(steps, {
				yPercent: 0,
				autoAlpha: 1,
				stagger: 0.3,
				duration: 1.3,
				ease: "power2.out",
			});
		});
	};

	tyx.functions.parallax = function () {
		// based on https://codepen.io/GreenSock/pen/BarmbXq
		const parallaxSections = document.querySelectorAll(".s-big-img");
		if (!parallaxSections) return;

		parallaxSections.forEach((section) => {
			const image = section.querySelector(".big-img_media");
			getRatio = (el) => window.innerHeight / (window.innerHeight + el.offsetHeight);

			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: section,
					start: "top bottom",
					end: "bottom top",
					scrub: true,
					pinSpacing: false,
					invalidateOnRefresh: true,
				},
			});

			tl.fromTo(
				image,
				{
					y: () => -window.innerHeight * getRatio(section),
				},
				{
					y: () => window.innerHeight * (1 - getRatio(section)),
					ease: "none",
				}
			);
		});
	};

	tyx.functions.parallaxBasic = function () {
		const parallaxTriggers = document.querySelectorAll(".anim-parallax-trigger");
		// const parallaxTriggers = document.querySelectorAll(".pricing_bg");
		if (!parallaxTriggers.length) return;

		parallaxTriggers.forEach((trigger) => {
			ScrollTrigger.update();
			const target = trigger.querySelector(".anim-parallax-target");
			// const target = trigger.querySelector(".img-cover");
			if (!target) return;

			const strength = parseFloat(trigger.dataset.parallaxStrength) || 20;

			gsap.set(target, { yPercent: -strength, scale: () => (100 + 2 * strength) / 100 });

			gsap.to(target, {
				yPercent: strength,
				ease: "none",
				scrollTrigger: {
					trigger: trigger,
					scrub: true,
					start: "top bottom",
					end: "bottom top",
					// markers: true,
				},
			});
		});
	};

	tyx.functions.textAnim = function () {
		const fromColor = "#696969";
		const toColor = "#ffffff";

		document.querySelectorAll(".text-anim").forEach((el) => {
			const split = new SplitText(el, {
				type: "words, chars",
				tag: "span",
			});

			gsap.set(el, { opacity: 1 });

			gsap
				.timeline({
					scrollTrigger: {
						trigger: el,
						start: "top 75%",
						end: "top top",
						scrub: 1,
					},
				})
				.fromTo(
					split.words,
					{ color: fromColor },
					{
						color: toColor,
						duration: 4,
						ease: "cubic.out",
						stagger: { each: 0.4 },
					}
				);
		});
	};

	tyx.functions.sticky5050 = function () {
		gsap.registerPlugin(ScrollTrigger, ExpoScaleEase);

		document.querySelectorAll(".s-sticky-5050").forEach((section) => {
			const items = section.querySelectorAll(".sticky-5050_left-item");
			const mediaInners = section.querySelectorAll(".sticky-5050_media-inner");
			const mediaWrapper = section.querySelector(".sticky-5050_media");
			items.forEach((item, i) => {
				if (i === 0) {
					return;
				}

				const mediaInner = mediaInners[i];
				if (!mediaInner) return;

				// Set initial scales
				gsap.set(mediaInner, { opacity: 0 });

				// let animation = gsap.fromTo(mediaInner, { opacity: 0 }, { opacity: 1, duration: 0.5 });

				let tl = gsap.timeline({
					scrollTrigger: {
						trigger: item,
						start: "top 70%", // when item top reaches bottom of media
						end: "top 30%", // when item top reaches top of media
						toggleActions: "play none reverse none",
						// animation: animation,
					},
				});
				tl.fromTo(mediaInner, { opacity: 0 }, { opacity: 1, duration: 0.5 });
			});
		});
	};

	tyx.functions.serviceHero = function () {
		const sections = document.querySelectorAll(".s-service-hero");
		if (!sections) return;

		sections.forEach((section) => {
			const heading = section.querySelector(".service-hero_heading");
			const bg = section.querySelector(".service-hero_bg");

			gsap.set(heading, { yPercent: 200, autoAlpha: 1 });

			const tl = gsap.timeline({});
			tl.to(
				heading,
				{
					yPercent: 0,
					duration: 1.5,
					ease: "power2.out",
					immediateRender: false,
				},
				0.5
			);

			const bg_tl = gsap.timeline({
				scrollTrigger: {
					trigger: section,
					start: "bottom 95%",
					end: "bottom 40%",
					scrub: true,
					// markers: true,
				},
			});
			// fade out bg
			bg_tl.to(bg, {
				opacity: 0.1,
				ease: "power2.out",
			});
		});
	};

	tyx.functions.visualiser = function () {
		const container = document.querySelector(".visualiser");
		if (!container) return;
		let bars = [];
		let simplex = new SimplexNoise();
		let time = 0;
		const barCountDsk = 150;
		const barCountMbl = 50;
		let mouseX = 0;

		// Animate bars
		function startAnimation(barCount) {
			let time = 0;

			function frame() {
				time += 0.005;
				const rect = container.getBoundingClientRect();

				bars.forEach((bar, i) => {
					const barX = (i / barCount) * rect.width;
					const distance = Math.abs(barX - mouseX);
					const proximity = Math.max(0, 1 - distance / 150); // 150px falloff

					const noise = simplex.noise2D(i * 0.1, time);
					let scale = gsap.utils.mapRange(-1, 1, 0.2, 1, noise);

					// Apply proximity boost
					scale += proximity * 0.25; // up to +0.5 added when cursor is near

					gsap.to(bar, {
						scaleY: scale,
						duration: 0.2,
						ease: "power2.out",
					});
				});

				requestAnimationFrame(frame);
			}

			frame();
		}

		// create bars
		function createBars(barCount) {
			container.innerHTML = ""; // move this here to ensure reset
			bars = []; // reinitialize
			for (let i = 0; i < barCount; i++) {
				const bar = document.createElement("div");
				bar.classList.add("bar");
				container.appendChild(bar);
				bars.push(bar);
			}
		}

		function cleanUp() {
			bars.length = 0; // Clear the bars array
			//kill tweens
			gsap.killTweensOf(bars);
		}

		let mm = gsap.matchMedia();

		mm.add("(min-width: 768px)", () => {
			cleanUp();
			// Create bars
			createBars(barCountDsk);

			container.addEventListener("mousemove", (e) => {
				const rect = container.getBoundingClientRect();
				mouseX = e.clientX - rect.left;
			});

			// Start animation
			startAnimation(barCountDsk);

			return () => {
				cleanUp();
			};
		});

		mm.add("(max-width: 767px)", () => {
			cleanUp();
			// Create bars
			createBars(barCountMbl);
			// Start animation
			startAnimation(barCountMbl);

			return () => {
				cleanUp();
			};
		});
	};

	tyx.functions.faq = function () {
		const faqGroups = document.querySelectorAll(".s-faq");
		if (!faqGroups) return;

		function open(array, itemObj) {
			// Close other open items in the same group
			array.forEach((el) => {
				if (el !== itemObj && el.tl.reversed() === false) {
					close(el);
				}
			});
			// Open the clicked item
			itemObj.tl.play();
			// Set the item to be open
			itemObj.item.classList.add("is-open");
		}

		function close(itemObj) {
			itemObj.tl.reverse();
			itemObj.item.classList.remove("is-open");
		}

		function toggle(array, itemObj) {
			itemObj.tl.reversed() ? open(array, itemObj) : close(itemObj);
		}

		faqGroups.forEach((group) => {
			const items = group.querySelectorAll(".faq-item");
			if (!items) return;
			let array = [];

			items.forEach((item) => {
				let itemObj = {
					item: item,
					header: item.querySelector(".faq-item_header"),
					body: item.querySelector(".faq-item_body"),
					icon: item.querySelector(".faq-item_icon"),
				};

				if (!itemObj.header || !itemObj.body) return;

				itemObj.tl = gsap.timeline({
					paused: true,
					reversed: true,
				});

				array.push(itemObj);

				itemObj.tl.to(itemObj.body, { height: "auto", duration: 0.2, ease: "none" }, 0);
				itemObj.tl.to(itemObj.icon, { rotate: 45, duration: 0.1, ease: "power2.out" }, "<");
				gsap.set(itemObj.body, { height: 0 });

				itemObj.header.addEventListener("click", function () {
					toggle(array, itemObj);
				});
			});
		});
	};

	tyx.functions.fancyHero = function () {
		const sections = document.querySelectorAll(".hero.is-fancy");
		if (!sections.length) return;

		let scrollTriggerOptions = {};

		sections.forEach((section) => {
			const media = section.querySelector(".media");
			if (!media) return;

			const video = media.querySelector("video");

			const triggerDistance = 40;

			scrollTriggerOptions = {
				trigger: section,
				start: `top+=${triggerDistance} top`,
				end: "+=20%", // pin for 100% of viewport height
				scrub: false,
				// markers: true,
				toggleActions: "play none none reverse",
				pin: true,
				pinSpacing: true,
				anticipatePin: 1,
			};

			gsap.set(media, { transformOrigin: "50% 75%", top: triggerDistance });
			gsap.set(section, { marginBottom: triggerDistance });
			gsap.set(media, { scale: 0.75, yPercent: 30 }); // CSS hides media to avoid FOUC
			gsap.fromTo(media, { autoAlpha: 0, duration: 0.5 }, { autoAlpha: 1 }); // then show

			let q = gsap.utils.selector(".hero_split-h1");

			const tl = gsap.timeline({
				scrollTrigger: {
					...scrollTriggerOptions,
				},
			});
			tl.timeScale(0.75); // slow down the timeline
			// tl.set(media, { autoAlpha: 1 }); // CSS hides media to avoid FOUC
			tl.to(
				q(":nth-child(even)"),
				{
					translateX: "-100vw",
					duration: 1.5,
					ease: "power3.out",
				},
				"0.05"
			);
			tl.to(
				q(":nth-child(odd)"),
				{
					translateX: "100vw",
					duration: 1.5,
					ease: "power3.out",
				},
				"0.05"
			);
			tl.to(
				".breadcrumbs",
				{
					autoAlpha: 0,
					duration: 1,
					ease: "power3.out",
				},
				"0"
			);
			tl.fromTo(
				media,
				{ scale: 0.75, yPercent: 30, duration: 1.5, ease: "power3.out" },
				{ scale: 1, yPercent: 0 },
				"0"
			);
			// play video halfway through timeline
			if (video) {
				tl.call(
					() => {
						video.play();
					},
					null,
					"0.5"
				);
			}
		});
	};

	/* ---------------------------------------------------------------------------
	   TYX Nav – hover-driven desktop, click-driven mobile + sub-nav companion
	--------------------------------------------------------------------------- */

	tyx.functions.nav = function () {
		/* ───────────────────────── CONFIG ───────────────────────── */
		const DEBUG = true; // 🔧 set true to see logs
		const log = (...a) => DEBUG && console.log("[tyx.nav]", ...a);

		// gsap.registerPlugin(ScrollTrigger);

		const nav = document.querySelector(".nav");
		const subnav = document.querySelector(".c-subnav");
		const subBtn = document.querySelector(".subnav_mob-btn");
		const subLinks = document.querySelector(".subnav_links");

		if (!nav) {
			console.error("❌ .nav element not found");
			return;
		}
		log("init", { nav, subnav });

		/* Thresholds (vh ratios) – tweak if ever needed */
		const MAIN_THRESHOLD = 0.5; // 50 vh
		const SUB_THRESHOLD = 1.0; // 100 vh

		/* ─────────────────────── 1) MAIN NAV show / hide ──────────────────────── */
		ScrollTrigger.create({
			trigger: document.body,
			start: "top top",
			end: "bottom bottom",
			onUpdate(self) {
				/* Always hide while sub-nav is open (per your “yes”) */
				if (subnav && subnav.classList.contains("is-open")) {
					nav.classList.add("is-hidden");
					nav.classList.add("is-past-threshold");
					return;
				}

				const inside = self.scroll() <= window.innerHeight * MAIN_THRESHOLD;

				nav.classList.toggle("is-hidden", !inside);
				nav.classList.toggle("is-past-threshold", !inside);
			},
		});

		/* ─────────────────────── 2) SUB-NAV open / close ──────────────────────── */
		if (subnav) {
			subnav.classList.add("dev");
			subnav.classList.remove("is-open");
			ScrollTrigger.create({
				trigger: document.body,
				start: () => `${window.innerHeight * SUB_THRESHOLD} top`,
				end: "bottom bottom",
				/* enter zone → open once and keep open */
				onEnter() {
					log("subnav → open");
					subnav.classList.add("is-open");
					nav.classList.add("is-hidden"); // keep main nav hidden
				},
				/* leave zone back upward → close */
				onLeaveBack() {
					log("subnav → close");
					subnav.classList.remove("is-open");
					/* main nav visibility now handled by its own trigger */
				},
			});
		}
		/* ───── sub-nav accordion: animate ONLY .c-subnav height ───── */
		if (subBtn && subLinks && subnav) {
			let linksOpen = false;
			const closeSubLinks = () => {
				if (!linksOpen) return;
				gsap.killTweensOf(subnav);
				gsap.to(subnav, {
					height: "var(--sub-nav-h)",
					duration: 0.4,
					ease: "power2.inOut",
					onComplete() {
						linksOpen = false;
					},
				});
				gsap.to(subBtn.querySelector("svg"), {
					rotateX: 0,
					transformOrigin: "center center",
					duration: 0.25,
					ease: "power2.out",
				});
			};

			const onSubBtn = () => {
				if (!linksOpen) {
					// OPEN: Animate from baseH to baseH + linksH
					subnav.style.height = getComputedStyle(subnav).getPropertyValue("--sub-nav-h");
					gsap.to(subnav, {
						height: subnav.scrollHeight + "px", // Animate to measured open height
						duration: 0.4,
						ease: "power2.inOut",
						onComplete() {
							subnav.style.height = "auto"; // Let it auto-expand if content changes
							linksOpen = true;
						},
					});
				} else {
					// CLOSE: Animate from current height to baseH (the var)
					gsap.to(subnav, {
						height: "var(--sub-nav-h)",
						duration: 0.4,
						ease: "power2.inOut",
						onComplete() {
							linksOpen = false;
						},
					});
				}

				// Arrow animation
				gsap.to(subBtn.querySelector("svg"), {
					rotateX: !linksOpen ? 180 : 0,
					transformOrigin: "center center",
					duration: 0.25,
					ease: "power2.out",
				});
			};

			subBtn.addEventListener("click", onSubBtn);
		}

		/* ─────────────────────── 3) matchMedia variants ───────────────────────── */
		const mm = gsap.matchMedia();

		/* ============================= DESKTOP (≥992 px) ======================== */
		mm.add("(min-width: 992px)", () => {
			const bar = nav.querySelector(".nav_bar");
			const barH = bar ? bar.offsetHeight : 0;
			let current = null;

			const panels = new Map();
			const handlers = new Map();

			function closeAll() {
				if (!current) return;
				log("desktop closeAll");

				const pane = panels.get(current);
				gsap.killTweensOf(pane);
				gsap.set(pane, { autoAlpha: 0, pointerEvents: "none" });
				gsap.to(nav, { height: barH, duration: 0.35 });

				current.classList.remove("is-active", "is-open");
				nav.classList.remove("is-open");
				current = null;
			}

			nav.querySelectorAll(".nav_link").forEach((link) => {
				const name =
					link.dataset.panel || [...link.classList].find((c) => c.startsWith("is-"))?.slice(3);
				const pane = nav.querySelector(`.nav_content.is-${name}`);

				if (pane) {
					panels.set(link, pane);
					gsap.set(pane, { autoAlpha: 0, pointerEvents: "none" });

					const openPane = (e) => {
						e.preventDefault();
						if (current === link) return;

						if (current) {
							const prevPane = panels.get(current);
							gsap.killTweensOf(prevPane);
							gsap.set(prevPane, { autoAlpha: 0, pointerEvents: "none" });
							current.classList.remove("is-active", "is-open");
						}

						const targetH = barH + pane.scrollHeight;
						gsap.set(pane, { autoAlpha: 0, pointerEvents: "auto" });
						gsap.to(nav, { height: targetH, duration: 0.35 });
						gsap.to(pane, { autoAlpha: 1, duration: 0.25, delay: 0.1 });

						link.classList.add("is-active", "is-open");
						nav.classList.add("is-open");
						current = link;
						log("desktop openPane", name);
					};

					link.addEventListener("mouseenter", openPane);
					link.addEventListener("focus", openPane);
					handlers.set(link, openPane);
					return;
				}

				const closeOnEnter = () => closeAll();
				link.addEventListener("mouseenter", closeOnEnter);
				link.addEventListener("focus", closeOnEnter);
				handlers.set(link, closeOnEnter);
			});

			nav.addEventListener("mouseleave", closeAll);
			nav.addEventListener("focusout", (e) => {
				if (!nav.contains(e.relatedTarget)) closeAll();
			});

			/* cleanup */
			return () => {
				handlers.forEach((fn, link) => {
					link.removeEventListener("mouseenter", fn);
					link.removeEventListener("focus", fn);
				});
				nav.removeEventListener("mouseleave", closeAll);
				nav.classList.remove("is-open");
				gsap.set(nav, { height: "auto" });
				panels.forEach((pane) => gsap.set(pane, { autoAlpha: 0, pointerEvents: "none" }));
			};
		});

		/* ============================== MOBILE (≤991 px) ======================== */
		mm.add("(max-width: 991px)", () => {
			const btn = nav.querySelector(".nav_mob-icon");
			const icons = btn.querySelectorAll(".nav_mob-icon-svg");
			const drawer = nav.querySelector(".nav_mob-content");
			let open = false;
			const accordions = [];

			gsap.set(icons[0], { autoAlpha: 0 });
			gsap.set(drawer, { height: 0, autoAlpha: 0 });

			const onBtn = () => {
				open = !open;
				log("mobile hamburger", open ? "open" : "close");
				nav.classList.toggle("is-open", open);

				const fullH = CSS.supports("height:100dvh") ? "100dvh" : "100vh";

				gsap
					.timeline()
					.to(icons[0], { autoAlpha: open ? 1 : 0, duration: 0.2 }, 0)
					.to(icons[1], { autoAlpha: open ? 0 : 1, duration: 0.2 }, 0)
					.to(
						drawer,
						{
							height: open ? fullH : 0,
							autoAlpha: open ? 1 : 0,
							display: open ? "block" : "none",
							duration: open ? 0.4 : 0.3,
							ease: open ? "power2.out" : "power2.in",
						},
						0
					);
			};
			btn.addEventListener("click", onBtn);

			nav.querySelectorAll("[data-toggle]").forEach((toggle) => {
				const key = toggle.dataset.toggle;
				const pane = nav.querySelector(`[data-details="${key}"]`);
				if (!pane) return;

				gsap.set(pane, { height: 0, autoAlpha: 0, overflow: "hidden" });

				const fn = (e) => {
					e.preventDefault();
					const isOpen = toggle.classList.toggle("is-open");
					toggle.querySelector(".nav_content-link-toggle")?.classList.toggle("is-open", isOpen);
					log("mobile accordion", key, isOpen ? "open" : "close");

					gsap.to(pane, {
						height: isOpen ? pane.scrollHeight : 0,
						autoAlpha: isOpen ? 1 : 0,
						duration: isOpen ? 0.4 : 0.3,
						ease: isOpen ? "power2.out" : "power2.in",
					});
				};

				toggle.addEventListener("click", fn);
				accordions.push({ toggle, fn });
			});

			/* cleanup */
			return () => {
				btn.removeEventListener("click", onBtn);
				accordions.forEach(({ toggle, fn }) => toggle.removeEventListener("click", fn));
				gsap.set(drawer, { height: 0, autoAlpha: 0 });
				nav.classList.remove("is-open");
				nav.style.removeProperty("height");
			};
		});
	};

	tyx.functions.magicModal = function () {
		//check we have some .magic-card elements
		const cards = document.querySelectorAll(".magic-card");
		if (!cards.length) return;

		const modals = document.querySelectorAll(".magic-modal");
		if (!modals.length) return;

		const mm = gsap.matchMedia();

		/* for each card, we have a hidden .magic-modal element. On click of the relevant button on each card:
		- open the modal
		- disable scroll on the body
		
		And on click of the close button:
		- close the modal
		- enable scroll on the body
		*/

		function openModal(modal) {
			gsap.set(modal, { pointerEvents: "auto" });
			gsap.to(modal, { autoAlpha: 1, duration: 0.3 });
			gsap.set(document.body, { overflow: "hidden" });
		}

		function closeModal(modal, enableScroll = false, delay = 0) {
			gsap.to(modal, { autoAlpha: 0, duration: 0.3, delay: delay });
			gsap.set(modal, { pointerEvents: "none" });
			if (enableScroll) {
				// if we are using the close button, we want to enable scroll on the body
				gsap.set(document.body, { overflow: "auto" });
			}
		}

		mm.add("(max-width: 768px)", () => {
			cards.forEach((card, i) => {
				const btn = card.querySelector(".magic-card_btn");
				// make button cover whole card
				gsap.set(btn, {
					innerHTML: "",
					backgroundColor: "transparent",
					borderRadius: "0",
					opacity: 0,
					gridColumn: "1 / -1",
					gridRow: "1 / 3",
					width: "100%",
					height: "100%",
					inset: 0,
				});
				const modal = modals[i];
				const prevModal = modals[(i + cards.length - 1) % cards.length];
				const nextModal = modals[(i + 1) % cards.length];
				console.log(prevModal, nextModal);
				const closeBtn = modal.querySelector(".magic-modal_close");
				const arrowWrap = modal.querySelector(".magic-modal_arrow-wrap");
				const prevBtn = modal.querySelector(".magic-modal_arrow.is-prev");
				const nextBtn = modal.querySelector(".magic-modal_arrow.is-next");
				gsap.set(arrowWrap, { autoAlpha: 1 });

				if (!btn || !modal || !closeBtn) return;

				gsap.set(modal, { autoAlpha: 0, display: "block", pointerEvents: "none" });

				card.addEventListener("click", function () {
					openModal(modal);
				});

				// if we have a next and prev button, add click events to them
				if (prevModal) {
					prevBtn.addEventListener("click", function () {
						openModal(prevModal);
						closeModal(modal, false, 0.3); // disable scroll on body
					});
				}
				if (nextModal) {
					nextBtn.addEventListener("click", function () {
						openModal(nextModal);
						closeModal(modal, false, 0.3); // disable scroll on body
					});
				}
				// close button
				closeBtn.addEventListener("click", function () {
					closeModal(modal, true); // enable scroll on body
				});
			});
			return () => {
				gsap.set(modals, { display: "none" });
				gsap.set(".magic-card_btn", { clearprops: "all" });
				gsap.set(document.body, { overflow: "auto" });
			};
		});
	};

	tyx.functions.handleVideos = function () {
		let lazyVideos = [].slice.call(document.querySelectorAll("video"));
		if (!lazyVideos.length) return;

		/* process:
		- loop through all videos
		- get the data src for each video
		- generate the poster URL for each video
		- generate the video URL for each video
		- set the poster attribute of the video element
		- then we get onto the lazy loading with GSAP ScrollTrigger...
			- create a scroll trigger for each video
			- when the video is 100vh from the top of the viewport, set the src attribute of the video element (if video is in a hero section, the video should be loaded immediately)
			- load the video
			- remove the lazy class from the video element
			- video should be paused
			- when video scrolls into view, play the video
			- when video scrolls out of view, pause the video
			if video is one that plays on hover, then play the video only on hover, not on scroll
			*/

		lazyVideos.forEach((video) => {
			if (!tyx.lazyLoadVideos) {
				tyx.helperFunctions.simpleVideoLoad(video);
				return;
			}

			const [dataSrc, videoSource] = tyx.helperFunctions.getVideoDataSrc(video);
			if (!dataSrc || !videoSource) return;

			const isCloudinary = dataSrc.includes("res.cloudinary.com");
			let videoURL, posterURL;

			if (isCloudinary) {
				// Use transformed Cloudinary URLs
				posterURL = tyx.helperFunctions.generatePosterURL(video, dataSrc);
				videoURL = tyx.helperFunctions.generateVideoURL(video, dataSrc);
			} else {
				// Use original URLs
				videoURL = dataSrc;
				posterURL = video.getAttribute("poster") || "";
			}

			// Set attributes
			if (posterURL) video.setAttribute("poster", posterURL);
			if (videoURL) videoSource.setAttribute("src", videoURL);

			video.muted = true;

			// create a scroll trigger for each video
			let loadTrigger = ScrollTrigger.create({
				trigger: video,
				start: "top 200%",
				onEnter: () => {
					if (video.dataset.load === "loaded") return; // don't load again
					// set the src attribute of the video element
					videoSource.setAttribute("src", videoURL);
					video.load();
					if (!video.autoplay) {
						video.addEventListener(
							"loadeddata",
							function () {
								video.pause();
							},
							false
						);
					}
					// console.log("video loaded");
					video.setAttribute("data-load", "loaded"); // set a data attribute to prevent loading again
				},
			});

			if (video.getAttribute("play-on-hover") !== "hover") {
				let playTrigger = ScrollTrigger.create({
					trigger: video,
					start: "top 110%",
					end: "bottom -20%",
					onEnter: () => {
						// console.log("video play");
						video.play();
					},
					onLeave: () => {
						// console.log("video pause");
						video.pause();
					},
					onEnterBack: () => {
						// console.log("video play");
						video.play();
					},
					onLeaveBack: () => {
						// console.log("video pause");
						video.pause();
					},
					// markers: true,
				});
			}
		});
	};

	tyx.helperFunctions.simpleVideoLoad = function (video) {
		let sourceElement = video.querySelector("source");
		let dataSrc = sourceElement.dataset.src;
		if (sourceElement && dataSrc) {
			video.muted = true;
			sourceElement.setAttribute("src", sourceElement.dataset.src);
			video.load();
		}
	};

	tyx.helperFunctions.generatePosterURL = function (video, dataSrc) {
		if (!dataSrc) return;

		const parts = dataSrc.split("/upload/");
		if (parts.length !== 2) return;

		const [base, rest] = parts;
		const restWithoutExtension = rest.split(".").slice(0, -1).join(".");
		const posterURL = `${base}/upload/so_auto/q_auto/${restWithoutExtension}.jpg`;

		// console.log("posterURL", posterURL);
		return posterURL;
	};

	tyx.helperFunctions.generateVideoURL = function (video, dataSrc, quality = "q_auto,f_auto") {
		if (!dataSrc) return;

		const parts = dataSrc.split("/upload/");
		if (parts.length !== 2) return;

		const [base, rest] = parts;
		const restWithoutExtension = rest.split(".").slice(0, -1).join(".");
		const videoURL = `${base}/upload/${quality}/${restWithoutExtension}.webm`;

		// console.log("videoURL", videoURL);
		return videoURL;
	};

	tyx.helperFunctions.getVideoDataSrc = function (video) {
		// check if the video's source element has a data-src attribute
		// only look at the first source element
		// also return the source element so we can later set the src attribute

		const videoSource = video.getElementsByTagName("source")[0];
		if (!videoSource) return;

		const dataSrc = videoSource.getAttribute("data-src");
		if (!dataSrc) return;
		return [dataSrc, videoSource];
	};

	tyx.functions.homeHero();
	tyx.functions.changeIntroColors();
	tyx.functions.handleVideos();
	tyx.functions.playVideosOnHover();
	tyx.functions.counter();
	// tyx.functions.magicCard();
	tyx.functions.serviceCard();
	tyx.functions.chaosMarquee();
	tyx.functions.process();

	tyx.functions.benefits();

	tyx.functions.textAnim();
	tyx.functions.sticky5050();
	tyx.functions.serviceHero();
	tyx.functions.visualiser();
	tyx.functions.faq();
	tyx.functions.testimonials();
	tyx.functions.magicCarousel();
	tyx.functions.largeSlider();
	tyx.functions.teamSlider();
	tyx.functions.fancyHero();
	tyx.functions.nav();
	tyx.functions.magicModal();
	ScrollTrigger.refresh();
	tyx.functions.parallax();
	tyx.functions.parallaxBasic();

	// Initialize the randomText function after fonts are loaded
	document.fonts.ready.then(function () {
		gsap.set(".anim-in", { autoAlpha: 1 });
		tyx.functions.randomText();
		// tyx.functions.counter();
	});
}
