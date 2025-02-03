/**
 * D3.js를 활용하여 Firestore에서 가져온 데이터를 기반으로 네트워크 시각화를 수행
 */

// 1. 임포트
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7";
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { db } from "./firebase_storymap_system.js";

// 2. 클래스 정의
class StoryMapVisualization {
    constructor(container) {
        this.container = container;
        this.circleNetworkContainer = d3.select("#circleNetwork");
        this.timelineContainer = d3.select("#timeline");
        this.selectedStory = null;
    }

    // 원형 네트워크 그리기
    drawCircleNetwork(stories) {
        const width = 800;
        const height = 400;
        const centerX = width / 2;
        const centerY = height / 2;

        const svg = this.circleNetworkContainer
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Genesis 노드 (중앙)
        const genesisNode = svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", 15)
            .attr("fill", "#ff0000")
            .attr("class", "genesis-node");

        // 각 스토리를 원형으로 배치
        const radius = 150;
        const angleStep = (2 * Math.PI) / Object.keys(stories).length;

        Object.entries(stories).forEach(([owner, storyData], index) => {
            const angle = index * angleStep;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            // 스토리 라인 (화살표)
            svg.append("path")
                .attr("d", `M ${centerX} ${centerY} L ${x} ${y}`)
                .attr("stroke", "#999")
                .attr("marker-end", "url(#arrow)")
                .attr("class", "story-line")
                .attr("id", `line-${owner}`);

            // 스토리 노드
            const storyNode = svg.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 10)
                .attr("fill", "#1f77b4")
                .attr("class", "story-node")
                .attr("id", `node-${owner}`);

            // 호버 효과
            const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            storyNode.on("mouseover", (event) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`
                    <h3>${storyData.title}</h3>
                    <p>${storyData.summary}</p>
                    ${storyData.image ? `<img src="${storyData.image}" width="100">` : ''}
                    <p>Author: ${owner}</p>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", () => {
                this.highlightStory(owner);
                this.selectedStory = owner;
                this.updateTimeline(storyData.chapters);
            });
        });
    }

    // 타임라인 그리기
    drawTimeline(stories) {
        // 기존의 수평 타임라인 코드...
    }

    // 스토리 하이라이트
    highlightStory(owner) {
        // 모든 노드와 라인 리셋
        d3.selectAll(".story-node").attr("fill", "#1f77b4");
        d3.selectAll(".story-line").attr("stroke", "#999");

        // 선택된 스토리 하이라이트
        d3.select(`#node-${owner}`).attr("fill", "#ff7f0e");
        d3.select(`#line-${owner}`).attr("stroke", "#ff7f0e");
    }

    // CSS 스타일 추가
    addStyles() {
        const styles = `
            .tooltip {
                position: absolute;
                padding: 10px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 5px;
                pointer-events: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .story-node {
                cursor: pointer;
                transition: all 0.3s;
            }
            .story-node:hover {
                r: 12;
            }
            .story-line {
                transition: all 0.3s;
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// 3. 유틸리티 함수
async function fetchStoryData() {
    const querySnapshot = await getDocs(collection(db, "stories"));
    const nodes = [];
    const links = [];
    let prevId = null;

    querySnapshot.forEach((doc) => {
        const story = doc.data();
        nodes.push({ id: story.title, summary: story.summary });
        if (prevId) {
            links.push({ source: prevId, target: story.title });
        }
        prevId = story.title;
    });

    drawGraph(nodes, links);
}

async function drawGraph(stories) {
    const width = 1200, height = 600;  // 더 넓은 공간 확보
    
    // 스토리별로 그룹화
    const storyGroups = {};
    stories.forEach(story => {
        if (!storyGroups[story.owner]) {
            storyGroups[story.owner] = [];
        }
        storyGroups[story.owner].push(story);
    });

    // 노드와 링크 데이터 생성
    const nodes = [GENESIS_NODE];
    const links = [];
    
    // 각 사용자의 스토리를 일직선으로 배치
    let yOffset = 100;
    Object.entries(storyGroups).forEach(([owner, chapters]) => {
        // 정렬된 챕터들
        chapters.sort((a, b) => {
            const numA = parseInt(a.filename.match(/^\d+/)[0]);
            const numB = parseInt(b.filename.match(/^\d+/)[0]);
            return numA - numB;
        });

        // Genesis에서 첫 챕터로 연결
        links.push({
            source: "0",
            target: chapters[0].id
        });

        // 챕터들을 순차적으로 연결
        chapters.forEach((chapter, index) => {
            nodes.push(chapter);
            if (index > 0) {
                links.push({
                    source: chapters[index-1].id,
                    target: chapter.id
                });
            }
        });
        
        yOffset += 100;  // 다음 스토리라인을 위한 수직 간격
    });

    // 시각화 구현
    const svg = d3.select("#graphContainer")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // 노드 클릭 이벤트 처리
    function handleNodeClick(event, d) {
        if (d.owner && d.chapters) {
            displayStoryDetails(d);
        }
    }

    // 스토리 상세 정보 표시
    function displayStoryDetails(story) {
        const detailsDiv = document.querySelector(".story-details");
        document.getElementById("selected-story-title").textContent = story.title;
        document.getElementById("selected-story-author").textContent = story.owner;

        const tbody = document.querySelector(".chapters-table tbody");
        tbody.innerHTML = "";
        
        story.chapters.forEach((chapter, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${chapter.summary}</td>
                <td>${chapter.image ? `<img src="${chapter.image}" alt="Chapter image" width="100">` : 'No image'}</td>
                <td><a href="${chapter.url}" target="_blank">Read Full Chapter</a></td>
            `;
        });

        detailsDiv.style.display = "block";
    }

    // 나머지 D3.js 시각화 코드...
}

// 4. 초기화 (마지막에 한 번만)
window.onload = function() {
    const visualization = new StoryMapVisualization();
    visualization.addStyles();
    fetchStoryData().then(stories => {
        visualization.drawCircleNetwork(stories);
        visualization.drawTimeline(stories);
    });
};
