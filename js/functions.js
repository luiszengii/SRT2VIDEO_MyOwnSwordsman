function chance(c) {
    return Math.random() < c;
}

function randomElem(arr) {
    return arr[ randomn(arr.length) ];
}

function limit(a, b, c) {
    a = Math.floor(a);
    if(a<b) a = b;
    if(a>c-1) a = c-1;
    return a;
}

function fmap(v, bf, bt, ef, et) {
    v = map(v, bf, bt, ef, et);
    v = constrain(v, ef, et);
    return v;
}

function brighter(c, p) {
    c[0] = floor( constrain( c[0] * p, 0, 255) );
    c[1] = floor( constrain( c[1] * p, 0, 255) );
    c[2] = floor( constrain( c[2] * p, 0, 255) );
    return c;
}

function lighter(c, p) {
    c[0] = floor( constrain( c[0] + p * 255, 0, 255) );
    c[1] = floor( constrain( c[1] + p * 255, 0, 255) );
    c[2] = floor( constrain( c[2] + p * 255, 0, 255) );
    return c;
}

function contrast(c, p) {
    c[0] = floor( constrain( 127 - (127-c[0]) * p, 0, 255) );
    c[1] = floor( constrain( 127 - (127-c[1]) * p, 0, 255) );
    c[2] = floor( constrain( 127 - (127-c[2]) * p, 0, 255) );
    return c;
}

function RGBtoHSV(c) {
  let h, s, v;

  let r = c[0];
  let g = c[1];
  let b = c[2];

  let rgb = [ r, g, b ];
  let min = Math.min( ...rgb );
  let max = Math.max( ...rgb );

  let hsv = [];

  v = max;
  let delta = max - min;
  if ( max != 0 )
    s = delta / max;
  else {
    s = 0;
    h = -1;
    hsv[0] = h;
    hsv[1] = s;
    hsv[2] = 0;
    return hsv;
  }
  if ( r == max )
    h = ( g - b ) / delta;
  else if ( g == max )
    h = 2 + ( b - r ) / delta;
  else
    h = 4 + ( r - g ) / delta;
  h *= 60;
  if ( h < 0 )
    h += 360;
  if ( h==0 )
    h = 0;

  hsv[0] = h;
  hsv[1] = s;
  hsv[2] = v;

  return hsv;
};

function HSVtoRGB(c) {
  let i;
  let r, g, b;

  let h = c[0];
  let s = c[1];
  let v = c[2];

  let rgb = [];


  if (s == 0) {
    r = g = b = floor(v);
    rgb[0] = r;
    rgb[1] = g;
    rgb[2] = b;
    return rgb;
  }
  h /= 60;
  i = floor( h );
  let f = h - i;
  let p = v * ( 1 - s );
  let q = v * ( 1 - s * f );
  let t = v * ( 1 - s * ( 1 - f ) );
  switch( i ) {
  case 0:
    r = v;
    g = t;
    b = p;
    break;
  case 1:
    r = q;
    g = v;
    b = p;
    break;
  case 2:
    r = p;
    g = v;
    b = t;
    break;
  case 3:
    r = p;
    g = q;
    b = v;
    break;
  case 4:
    r = t;
    g = p;
    b = v;
    break;
  default:
    r = v;
    g = p;
    b = q;
    break;
  }
  rgb[0] = floor( constrain(r,0,255) );
  rgb[1] = floor( constrain(g,0,255) );
  rgb[2] = floor( constrain(b,0,255) );
  return rgb;
}

function checkIfBlack(v) {
    if(Array.isArray(v)) {
        if(v[0] < threshold && v[1] < threshold && v[2] < threshold) return true;
    } else {
        if(v < threshold) return true;
    }
    return false;
}

function saturated(c, power) {
  let hsv = RGBtoHSV(c);
  hsv[1] *= power;
  let rgb = HSVtoRGB(hsv);
  return rgb;
}

function formatText(text) {
    text = text.replaceAll('<br />', ' ');
    text = text.replaceAll(/<[^>]*>?/gm, ' '); // remove html
    text = text.replaceAll(/\s\s+/g, ' '); // double spaces
    text = text.replaceAll('\'', '\'');
    text = text.replaceAll('"', '');
    text = text.replaceAll('"', '');
    text = text.replaceAll('--', '—');
    text = text.replaceAll('- ', ' ');
    text = text.replaceAll(' a ', ' a&nbsp;');
    text = text.replaceAll(' I ', ' I&nbsp;');
    text = text.trim();
    return text;
}

function formatFileName(filename) {
  let name = nameAndFormat(filename)[0];
  let format = nameAndFormat(filename)[1];
  name = getTitleFromFilename(name);
  return name + "." + format;
}

function nameAndFormat(filename) {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return [ filename, '' ];
  let name = filename.slice(0, lastDotIndex);
  let format = filename.slice(lastDotIndex + 1);
  return [name, format];
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
    return match.toUpperCase();
  });
}

function getTitleFromFilename(title) {
  title = title.replace("YTS", "");
  title = title.replace("MX", "");
  title = title.replace("RARBG", "");
  title = title.replace(/[\[\]]/g, "")
  title = title.replace(/\b\d{4}\b/, '');
  // remove resolution (e.g. 720p, 1080p)
  title = title.replace(/\b\d{3,4}p\b/, '');
  // remove video codec (e.g. x264, x265)
  title = title.replace(/\bx\d{3}\b/, '');
  // remove audio codec (e.g. AAC, DTS, AC3)
  title = title.replace(/\b(DD|DTS|AC3|AAC)\b/, '');
  // remove group or uploader name (e.g. EVO, YIFY, YTS)
  title = title.replace(/\b(WEBRip|EVO|YIFY|YTS)\b/, '');
  // remove AAC5.1
  title = title.replace(/\bAAC5\.1\b/, '');
  title = title.replace(/[.-]/g, ' ');
  title = toTitleCase(title);
  title = title.trim();
  return title;
}

function getFileNameFromPath(path) {
  return path.split("/").pop();
}

function mobileAndTabletCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};