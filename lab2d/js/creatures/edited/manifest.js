'use strict';
// Edited creatures, committed: one file per creature written by `npm run lab2d:import -- path/to/<creature>.svg`.
// Each registers the SVG text with RIG; the lab turns them into creatures at boot. Generated: edit the list by importing.
const EDITED_CREATURES = [];
for (const id of EDITED_CREATURES) document.write('<script src="js/creatures/edited/' + id + '.js"><\/script>');
