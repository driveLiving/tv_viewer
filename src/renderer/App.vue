<template style="margin: 0px;">
<!--  <el-container style="height: 100%; border: 1px solid #eee">-->
<!--    <el-aside width="210px" style="background-color: rgb(238, 241, 246)">-->
<!--      <el-menu class="el-menu-vertical-demo"  :unique-opened="true">-->
<!--        <h3 style="margin-left: 25px;" @click="reloadList(null)">节目列表</h3>-->
<!--        <el-submenu :index="(i+1)+''" v-for="(item,i) in playerList">-->
<!--          <template slot="title">-->
<!--            <i class="el-icon-location"></i>-->
<!--            <span slot="title">{{item.groupName}}</span>-->
<!--          </template>-->
<!--          <el-menu-item-group>-->
<!--            <span slot="title"></span>-->
<!--            <el-menu-item :index="i+'-'+j" @click="playOne(jtem.url)" v-for="(jtem,j) in item.list">{{jtem.name}}</el-menu-item>-->
<!--          </el-menu-item-group>-->
<!--        </el-submenu>-->
<!--      </el-menu>-->
<!--    </el-aside>-->

<!--    <el-container>-->
<!--      <el-main  v-loading="loading">-->
<!--        <section>-->
<!--          <d-player ref="player" style="width: 100%;height: 100%;" :options="options"></d-player>-->
<!--        </section>-->
<!--      </el-main>-->
<!--    </el-container>-->
<!--  </el-container>-->


    <div class="layout-content">
        <Row>
            <i-col span="5" >
                <Menu width="auto" style="overflow-y:auto;">
                    <Submenu :name="(i+1)+''" :key="(i+1)+''" v-for="(item,i) in playerList">
                        <template slot="title">
                            <Icon type="ios-navigate"></Icon>
                            {{item.groupName}}
                        </template>
                        <Menu-item :name="i+'-'+j" :key="i+'-'+j"  @click.native="playOne(jtem.url)" v-for="(jtem,j) in item.list">{{jtem.name}}</Menu-item>
                    </Submenu>

                </Menu>
            </i-col>

            <i-col span="19">
                <div class="layout-content-main">
                            <section>
                              <d-player ref="player" style="width: 100%;height: 100%;" :options="options"></d-player>
                            </section>

                </div>
            </i-col>
        </Row>
    </div>
</template>
<script>
  let Hls = require('hls.js');
  import dPlayer from 'vue-dplayer'
  import 'vue-dplayer/dist/vue-dplayer.css'
  const ipcRenderer = require('electron').ipcRenderer;
  const fs = require('fs');




  export default {
    components: {
      dPlayer
    },
    props: {
      source: {
        type: String,
        default: ''
      }
    },
    data() {

      return {
        form:{
          name:""
        },
        player: null,
        options: {
          video: {
            url: ''
          },
          contextmenu: [
            {}
          ]
        },
        loading:false,
        hls: '',
        playerList:[
          {
            groupName:"央视",
            list:[
              {name:"CCTV1",url:"http://144.48.240.144:2019/SunTv.php?name=CCTV1HD"},
              {name:"CCTV2",url:"http://144.48.240.144:2019/SunTv.php?name=CCTV2HD"}
            ]
          },
          {
            groupName:"卫视",
            list:[
              {name:"安徽卫视",url:"http://101.71.255.229:6610/zjhs/2/10002/index.m3u8?virtualDomain=zjhs.live_hls.zte.com"},
              {name:"北京卫视",url:"http://101.71.255.229:6610/zjhs/2/10005/index.m3u8?virtualDomain=zjhs.live_hls.zte.com"}
            ]
          }
        ]


      }
    },
    mounted() {
      this.reloadList(null);
      this.player = this.$refs.player.dp



      //触发输入框
      const thiz = this;
      ipcRenderer.on('inputText', function (event, message) {
        console.log(222);
        const h = thiz.$createElement;
        thiz.$message({
          message: h('p', null, [
            h('span', null, '内容可以是 '),
            h('i', { style: 'color: teal' }, 'VNode')
          ])
        });

      });

      ipcRenderer.on('selectedFile', function (event, message) {
        const path = message.path[0];
        const data = fs.readFileSync(path, 'utf-8');
        thiz.loadData(data);
      });

      ipcRenderer.on('toInputUrl', function (event, message) {
        console.log(111);
        thiz.$prompt('请输入在线源', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
            if(!value.startsWith("http")){
              return;
            }
            thiz.reloadList(value);

        }).catch(() => {

        });
      });
    },
    methods: {
      reloadList(url){
        let thiz = this;
        if(url == null){
          url = 'http://dd.laigc.com:10080/linsongze/tv/raw/branch/master/m.txt?xxx='+Math.random();
        }else{
            if(url.includes("?")){
              url = url+'&xxx='+Math.random();
            }else{
              url=url+'?xxx='+Math.random();
            }

        }
        this.$axios.get(url).then(res => {
          let content = res.data;
          thiz.loadData(content);
        });
      },
      loadData(content){
        let list = content.split("\n");
        list = list.filter(s=>s.trim().length>0)
        let rs = []
        let groupName = null;
        let group = {}
        for (let line of list){
          line = line.trim();
          if(line.includes("#genre#")){//新分组
            groupName = line.split(",")[0];
            group={groupName:groupName,list:[]}
            rs.push(group)
          }else{
            if(groupName == null)continue;
            if(!line.includes(",")){continue;};
            let ss=line.split(',');
            group.list.push({name:ss[0],url:ss[1]})

          }
        }
        console.log(rs);
        this.playerList = rs;
      },
      playOne (url) {
        console.log(url);
        this.getStream(url);

      },
      getStream(source) {
        this.player.switchVideo({
          url: source
        })
        this.player.play();

      }

    },
  };
</script>

<style>

  html,body{margin:0;padding:0;height: 100%;}

</style>
