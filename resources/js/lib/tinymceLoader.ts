// TinyMCE Loader
// Helper to bundle TinyMCE core and plugins via Vite

import tinymce from 'tinymce/tinymce';

// Theme
import 'tinymce/themes/silver';

// Icons
import 'tinymce/icons/default';

// Localizaion (optional, e.g. 'tinymce-i18n/langs5/id.js')
// import 'tinymce-i18n/langs/id';

// Models
import 'tinymce/models/dom';

// Plugins
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/code';
// import 'tinymce/plugins/image'; // if needed
// import 'tinymce/plugins/table'; // if needed

export default tinymce;
