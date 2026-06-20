export const
    debugMode = false,
    // Uncomment to use local host for development
    //host = "http://localhost:3000",
    // Uncomment to use remote host for production
    host = "https://slava-sanin.github.io/sok-spo-rot-react",
    CurPath= window.location.pathname,
    soundPath = "/static/sound/",
    Backgrounds= {
        //backgroundDefault: host + "/static/backgrounds/grand1.jpg",
        backgroundDefault: host + "/static/images/kandinsky-download-1686290078868.png",

        //backgroundTab1: host + "/static/backgrounds/grand2.jpg",
        backgroundTab1: host + "/static/images/kandinsky-download-1686290520138.png",

        //backgroundTab2: host + "/static/backgrounds/grand3.jpg",
        backgroundTab2: host + "/static/images/kandinsky-download-1686289628458.png",

        //backgroundTab3: host + "/static/backgrounds/grand4.jpg",
        backgroundTab3: host + "/static/images/kandinsky-download-1686291071861.png",

        backgroundsPath: "/static/images/",
        backgroundsList: host + "/static/backgrounds_list.txt",
        list: {}
    },
    MaxLevel = {
        socoban: 20,
        spot: 1,
        rotms: 20
    },
    glob_sound= true,
    table= 1,
    PlayerDlg = {
        color: 2,
        is: 1
    },
    ComputerDlg = {
        color: 3,
        is: 2
    },
    toolbarMode = true,
    virtual_buttons_moving = 0,
    spotRandomLevel = true;

