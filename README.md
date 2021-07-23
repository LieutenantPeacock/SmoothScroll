# SmoothScroll.js

A cross-browser compatible, lightweight, easy-to-use library for smooth scrolling!

```js
smoothScroll({options});
```

## Simple Uses

Scroll to y-position 1000px in 750 milliseconds:

```js
smoothScroll({yPos: 1000, duration: 750});
```

Scroll to the bottom of the page:

```js
smoothScroll({yPos: 'end'});
```

Scroll to x-position 500px and y-position 500px:

```js
smoothScroll({xPos: 500, yPos: 500});
```

## Including the Script
The script can be included via CDN by adding the following into the head of the HTML page:

```html
<script src="https://cdn.jsdelivr.net/gh/LieutenantPeacock/SmoothScroll@1.2.0/src/smoothscroll.min.js" integrity="sha384-UdJHYJK9eDBy7vML0TvJGlCpvrJhCuOPGTc7tHbA+jHEgCgjWpPbmMvmd/2bzdXU" crossorigin="anonymous"></script>
```

You can also download [smoothscroll.min.js](src/smoothscroll.min.js) and include it in the head of the page using your own path:

```html
<script src="path/to/smoothscroll.min.js"></script>
```

## Options

<table>
	<tr><th>Option</th><th>Description</th><th>Default</th></tr>
	<tr>
		<td>yPos</td>
		<td>The y-position to scroll to. If specified as a number, it is an absolute number of pixels
		from the top. It can also be specified as a relative amount from the current position.
		It can also be the special string values <code>"start"</code> (the top of the scrolling area),
		<code>"center"</code> (the middle of the scrolling area),
		and <code>"end"</code> (the bottom of the scrolling area).
		A relative number of pixels is specified as a string prefixed with + (to scroll down 
		a certain number of pixels) or - (to scroll up a certain number of pixels), 
		e.g. <code>'+100'</code>, <code>'-50'</code>.
		A relative percentage is specified by further adding the % symbol to the end of the string,
		which indicates scrolling by a percentage of the entire height, e.g. <code>'+10%'</code>, <code>'-15%'</code>.</td>
		<td>No default.</td>
	</tr>
	<tr>
		<td>xPos</td>
		<td>The x-position to scroll to. If specified as a number, it is an absolute number of pixels
		from the left. It can also be specified as a relative amount from the current position.
		It can also be the special string values <code>"start"</code> (the left of the scrolling area),
		<code>"center"</code> (the middle of the scrolling area),
		and <code>"end"</code> (the right of the scrolling area).
		A relative number of pixels is specified as a string prefixed with + (to scroll down 
		a certain number of pixels) or - (to scroll up a certain number of pixels), 
		e.g. <code>'+100'</code>, <code>'-50'</code>.
		A relative percentage is specified by further adding the % symbol to the end of the string,
		which indicates scrolling by a percentage of the entire width, e.g. <code>'+10%'</code>, <code>'-15%'</code>.</td>
		<td>No default.</td>
	</tr>
	<tr>
		<td>duration</td>
		<td>The amount of time the scrolling takes (in milliseconds).</td>
		<td><code>500</code></td>
	</tr>
	<tr>
		<td>scrollingElement</td>
		<td>The HTML element to scroll instead of the window.</td>
		<td>No default.</td>
	</tr>
	<tr>
		<td>toElement</td>
		<td>The HTML element to scroll to. This option overrides the 
		<code>xPos</code> and <code>yPos</code> options.</td>
		<td>No default.</td>
	</tr>
	<tr>
		<td>preventUserScroll</td>
		<td>Prevent the user from scrolling during the smooth scroll animation.</td>
		<td><code>true</code></td>
	</tr>
	<tr>
		<td>easing</td>
		<td>The easing function. It can either be a string that is the name of one of the
		predefined easing functions (in <code>smoothScroll.easing</code>), or a function
		that accepts the percentage of time that has passed (in its decimal form, between 0 and 1)
		and returns the percentage of the scrolling distance to scroll to at the current time
		(as a number between 0 and 1).</td>
		<td><code>'linear'</code></td>
	</tr>
	<tr>
		<td>complete</td>
		<td>The callback function to invoke when the smooth scrolling is complete.</td>
		<td>No default.</td>
	</tr>
	<tr>
		<td>firstAxis</td>
		<td>The first axis to scroll if changing both the x- and y-positions.
		There are two possible values: <code>'x'</code> and <code>'y'</code>.
		If not specified, both axes will scroll at the same time.
		</td>
		<td>
		No default.
		</td>
	</tr>
	<tr>
		<td>scrollEvents</td>
		<td>
		An array of strings indicating the names of events that will stop the scrolling animation
		if the <code>preventUserScroll</code> option is set to <code>false</code>.
		</td>
		<td>
			<code>['scroll', 'mousedown', 'wheel', 'DOMMouseScroll', 'mousewheel', 'touchmove']</code>
		</td>
	</tr>
	<tr>
		<td>scrollKeys</td>
		<td>An array of integer key codes represent the keys that will stop the scrolling
		animation when pressed by the user 
		if the <code>preventUserScroll</code> option is set to <code>false</code>.
		</td>
		<td><code>[37, 38, 39, 40, 32]</code></td>
	</tr>
	<tr>
		<td>block</td>
		<td>The position of the element of the element to scroll to 
		(specified by the <code>toElement</code> option) relative to the top of the container.
		The value can be <code>"start"</code> (the top of the element is aligned to the top of the visible area),
		<code>"center"</code> (the element is in the vertical center of the visible area),
		<code>"end"</code> (the bottom of the element is aligned with the bottom of the visible area),
		or a string indicating the percentage, e.g. <code>'50%'</code>.
		If not specified, it is the same as <code>"start"</code>.
		</td>
		<td>No default.</td>
	</tr>
	<tr>
		<td>inline</td>
		<td>The position of the element of the element to scroll to 
		(specified by the <code>toElement</code> option) relative to the left of the container.
		The value can be <code>"start"</code> (the left of the element is aligned to the left of the visible area),
		<code>"center"</code> (the element is in the horizontal center of the visible area),
		<code>"end"</code> (the right of the element is aligned with the right of the visible area),
		or a string indicating the percentage, e.g. <code>'50%'</code>.
		If not specified, it is the same as <code>"start"</code>.</td>
		<td>No default.</td>
	</tr>
	<tr>
		<td>allowAnimationOverlap</td>
		<td>A boolean value indicating whether or not multiple simultaneous animations are
		allowed on the same container.</td>
		<td><code>false</code></td>
	</tr>
	<tr>
		<td>paddingTop</td>
		<td>A certain number of pixels to add to the y-position to scroll to.
		If not specified, it is the same as <code>0</code>.</td>
		<td>No default.</td>
	</tr>
	<tr>
		<td>paddingLeft</td>
		<td>A certain number of pixels to add to the x-position to scroll to.
		If not specified, it is the same as <code>0</code>.</td>
		<td>No default.</td>
	</tr>
</table>

## Return Value

`smoothScroll` returns an object with the `destroy` property which is a function that stops
the scrolling when called.

```js
var s = smoothScroll({yPos: 5000, duration: 3000});
// Stop the scrolling sometime later
s.destroy();
```

## Instantiation

Using the `new` operator will create an instance with the passed in options as defaults. Properties
specified in this options object will override the original defaults. Call the `smoothScroll` method on
the returned value to perform smooth scrolling with these defaults.

```js
var scroller = new smoothScroll({duration: 700, block: 'center'});
scroller.smoothScroll({yPos: 500}); // duration is 700 (rather than the original default of 500)
```

## Getting and Setting Global Defaults

`smoothScroll.defaults()` returns an object containing the default values for each option.
<br>
Passing an object to `smoothScroll.defaults` will overwrite each option in the defaults with 
the value from that object if it is set.

```js
smoothScroll.defaults({duration: 700}); // set default duration to 700ms
```

## Other Methods and Properties

`smoothScroll.stopAll()` stops all current scroll animations and returns `true`/`false` depending
on whether there were running animations that were stopped.

`smoothScroll.scrolling()` returns `true`/`false` depending on whether or not there are current scrolling
animations.

`smoothScroll.nativeSupported` indicates whether or not the CSS `scroll-behavior` property is supported
in the current browser.

`smoothScroll.easing` is an object containing the predefined easing functions.

## Examples

Examples of common use cases can be found in the [examples](examples) folder. Note that many newer JavaScript
features are not used in order to demonstrate more cross-browser compatible code.