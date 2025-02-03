"""
D3.js를 활용하여 Firestore에서 가져온 데이터를 기반으로 네트워크 시각화를 수행
"""

// D3.js 기반 스토리 네트워크 시각화
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7";
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { db } from "./firebase_storymap_system.js";

// Firestore에서 스토리 데이터를 가져와 네트워크 시각화
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

// D3.js를 활용한 그래프 그리기
function drawGraph(nodes, links) {
    const width = 800, height = 600;
    const svg = d3.select("#graphContainer")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

    const simulation = d3.forceSimulation(nodes)
                         .force("link", d3.forceLink(links).id(d => d.id))
                         .force("charge", d3.forceManyBody())
                         .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", "#999");

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", "blue")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}

// Firestore 데이터를 불러와 시각화 실행
window.onload = function() {
    fetchStoryData();
};
