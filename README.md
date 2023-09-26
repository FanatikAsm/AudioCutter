<img src="https://raw.githubusercontent.com/matiassingers/awesome-readme/master/icon.png" align="right" />

# AudioCutter [![Awesome](https://cdn.jsdelivr.net/gh/sindresorhus/awesome@d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome#readme)
> **WARNING**
> CUT FILE WORK ONLY ON SERVER OR LOCAL SERVER!!!!.
<br />
Record your sound or download mp3 file, then choise timeline and cut it in browser interface.


### Video. How is that work ?
[![CLICK ME TO PLAY](https://i.ytimg.com/vi/Hc79sDi3f0U/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUTUBE_VIDEO_ID_HERE)

<table align="right" >
  <tr>
    <td>
    <center>
      <a href="" target="blank"><img src="y_min.svg" alt="youtube" align="left" /></a>
      <dl>
       <dt><b>Site weight</b></dt>
       <dd><a href="" target="blank">55kb</a></dd>
       <dt><b>Site requests</b></dt>
       <dd><a href="" target="blank">12</a></dd>
       <dt><b>CSS</b></dt>
       <dd><a href="" target="blank">12kb</a></dd>
       <dt><b>JS</b></dt>
       <dd><a href="" target="blank">12kb</a></dd>
      </dl>
    </center>
    <p align="right"><a href="" target="blank" align="right" >Data_filter</a></p>
    </td>
  </tr>
</table>


# 🤖 Desciption
### Languages :
<div>
  <img src="https://github.com/devicons/devicon/blob/master/icons/html5/html5-original.svg" title="HTML5" alt="HTML" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/css3/css3-plain-wordmark.svg"  title="CSS3" alt="CSS" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/javascript/javascript-original.svg" title="JavaScript" alt="JavaScript" width="40" height="40"/>&nbsp;
</div>
<br />


🚀 There are 12 people in the database who can be filtered by parameters. You can filter by : 1)user role 2)language 3)subscription 4)country 5) regions 6)city and etc...
<br /> Regions parametr can be active only if you choise contry. Because regions contains value information about the selected country.
<br /> City parametr can be active only if you choise Regions. Because cities contains value information about the selected regions.
- 📊 Show filtered information by parameters.
- 💯 What percentage of users remain on the selected parameter.
- ❌ Reset all parametrs in the selected column.

![The long journey from experimentation to production.](https://disk.yandex.kz/i/lPmkfJMs5erbvw)

ZenML provides a user-friendly syntax designed for ML workflows, compatible with
any cloud or tool. It enables centralized pipeline management, enabling
developers to write code once and effortlessly deploy it to various
infrastructures.
<div align="center">
    <img src="docs/book/.gitbook/assets/stack.gif">
</div>

# 📀 Quickstart
Open in your browser file which called "index.html". 
It will load the remaining files.
<div align="center">
    <img src="docs/book/.gitbook/assets/stack.gif">
</div>



# 📜 Documentation
ZenML allows you to create and manage your own MLOps platform using 
best-in-class open-source and cloud-based technologies. Here is an example of 
how you could set this up for your team:

## 🔎 1. Filter

There are three blocks with filters on the page. Every block has three select tags with onchange attribute.

```html
<select class="select" onchange="filter()">
    <option>...</option>
    <option>...</option>
    <option>...</option>
</select>
```

```javascript
function filter(){
   //code which check/filter from all select block....
}

filter();
```

Also the function performs:

- **Count**: How many percent of a hundred is the selected block , 
then displays on the graphic. 

- **Active/not active select block with country and region**: If you have selected a country, then the block with the region becomes active. If a region is selected, the city block becomes active

## 📋 2. Open and check data filter

Shows filtered users with information about each.

```html
<button class="container_info_block_button">Ready list</button>
```

```javascript
document.onclick = e=>{
  if(){
    
  }else if( e.target.className == 'container_info_block_button' ){
     // some code
  }
}
```

When you run a pipeline with this stack set, it will be running on your deployed
Kubernetes cluster.

You can also [deploy your own tooling manually](https://docs.zenml.io/stacks-and-components/stack-deployment).

## 📑 3. New information inside filtered data

Here's an example of updating user information:

```html
<div class="users_info_block_div3_container">
    <div data-id="0" class="users_info_block_div3_button"></div>
    <div data-id="1" class="users_info_block_div3_button"></div>
    <div data-id="2" class="users_info_block_div3_button"></div>
</div>
```

```javascript
document.onclick = e=>{
  if(){
    
  }else if( e.target.className == 'users_info_block_div3_button' ){
     // some code
  }
}
```



## 📛 4. Reset filter block

Click on the button inside block and reset all ‹select› tags in this container.



<div align="center">
    <img src="docs/book/.gitbook/assets/stack.gif">
</div>


# 🗺 Roadmap
index.html is a main file which loads:
- javascript.js
- style.css
<div align="center">
    <img src="docs/book/.gitbook/assets/stack.gif">
</div>


# 🆘 Getting Help
If you have any difficulties or questions about using the program, create
a discussion in this repository or write to e-mail
<dzonkarter.1995@gmail.com>.
<div align="center">
    <img src="docs/book/.gitbook/assets/stack.gif">
</div>


# 📘 License
[MIT © Mark Filippov](https://github.com/FanatikAsm/AudioCutter/blob/main/LICENSE.TXT)   
Copyright © «2023» «FanatikAsm»





1) Record your sound, then choise one or two timelines on graphic. After that, your record sound will cut in your choice timeline
2) Download mp3 file. Choise one or two audio file. If will you choice 1 audio file , you can use two timelines for 1 sound graphic.
   If you will choice 2 audio files, you will have two sound graphics
