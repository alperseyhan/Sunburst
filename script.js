// Verilerin JSON formatına dönüştürülmesi
const data = {
    "name": "ESG",
    "children": [
      {
        "name": "Governance",
        "weight": 0.242,
        "children": [
          { "name": "Memberships In Associations and Initiatives", "value": 0.01748102698147747, "abbreviation": "MAI-G1", "localWeight": 0.07223869060184272 },
          { "name": "Financial Performance", "value": 0.03470882715153132, "abbreviation": "FP-G2", "localWeight": 0.14343094535630047 },
          { "name": "Employee Recruitment", "value": 0.04020081940834824, "abbreviation": "ER-G3", "localWeight": 0.16612608391127698 },
          { "name": "Ethics and Compliance Programs", "value": 0.04229658506580994, "abbreviation": "ECP-G4", "localWeight": 0.1747866372679967 },
          { "name": "Transparency and Disclosure", "value": 0.040097725238929356, "abbreviation": "TD-G5", "localWeight": 0.16570005700705698 },
          { "name": "Risk Management and Emergency Planning", "value": 0.03565572973244921, "abbreviation": "RMEP-G6", "localWeight": 0.14734393071153687 },
          { "name": "Data Privacy and Cyber Security", "value": 0.03154909597970734, "abbreviation": "DPCS-G7", "localWeight": 0.13037365514398946 }
        ]
      },
      {
        "name": "Social",
        "weight": 0.326,
        "children": [
          { "name": "Employee Rights and Safety", "value": 0.06782798556897228, "abbreviation": "ERS-S1", "localWeight": 0.06782798556897228 },
          { "name": "Training and Development", "value": 0.05174133425990526, "abbreviation": "TD-S2", "localWeight": 0.05174133425990526 },
          { "name": "Community Relations and Social Responsibility", "value": 0.03954733341776177, "abbreviation": "CRSR-S3", "localWeight": 0.03954733341776177 },
          { "name": "Diversity and Inclusion", "value": 0.02564108299985692, "abbreviation": "DI-S4", "localWeight": 0.02564108299985692 },
          { "name": "Social Media Activity", "value": 0.019638607692480388, "abbreviation": "SMA-S5", "localWeight": 0.019638607692480388 },
          { "name": "Customer Relations", "value": 0.062855062397818, "abbreviation": "CR-S6", "localWeight": 0.062855062397818 },
          { "name": "Human Rights and Ethical Practices", "value": 0.058769207351764066, "abbreviation": "HREP-S7", "localWeight": 0.058769207351764066 }
        ]
      },
      {
        "name": "Environmental",
        "weight": 0.432,
        "children": [
          { "name": "Carbon Emissions", "value": 0.08088563801921969, "abbreviation": "CE-E1", "localWeight": 0.1872397908929934 },
          { "name": "Fuel Usage and Efficiency", "value": 0.0772131881816168, "abbreviation": "FUE-E2", "localWeight": 0.1787385444851406 },
          { "name": "Energy Consumption", "value": 0.05990500140246517, "abbreviation": "EC-E3", "localWeight": 0.13867233059813183 },
          { "name": "Water Pollution and Waste Management", "value": 0.06615869043222651, "abbreviation": "WPWM-E4", "localWeight": 0.15314881189836077 },
          { "name": "Noise Pollution Control", "value": 0.02240998117878073, "abbreviation": "NPC-E5", "localWeight": 0.05187620809560501 },
          { "name": "Marine Biodiversity and Ecosystem Management", "value": 0.061670938982013264, "abbreviation": "MBEM-E6", "localWeight": 0.1427602477021064 },
          { "name": "Environmental Compliance and Reporting", "value": 0.06374613855686631, "abbreviation": "ECR-E7", "localWeight": 0.14756406632766247 }
        ]
      },
    ]
};
  
// Zoomable Sunburst Grafiği
const width = 500; // A4 genişliğine uygun boyut
const height = width;
const radius = width / 4;
  
// Renk skalası oluştur - sabit renkler kullanalım (Daha belirgin renkler kullanalım)
const colorMap = {
  "Environmental": "#00C853",  // Parlak Yeşil
  "Social": "#2962FF",        // Parlak Mavi
  "Governance": "#FF6D00"     // Parlak Turuncu
};
 
// Hiyerarşi oluştur
const hierarchy = d3.hierarchy(data)
    .sum(d => {
        if (typeof d.value === "undefined" || isNaN(d.value)) {
            console.warn("Missing or NaN value detected for:", d);
            return 0; // Varsayılan değer
        }
        return d.value;
    })
    .sort((a, b) => (b.value || 0) - (a.value || 0)); // `NaN` hatasını önle

// Partition oluştur
const root = d3.partition()
    .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

root.each(d => {
    d.current = d;
    if (isNaN(d.y0) || isNaN(d.y1)) {
        console.error("NaN detected in node:", d);
    }
});
  
// Arc oluşturma
const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => {
        // İç daire için normal radius
        return d.y0 * radius;
    })
    .outerRadius(d => {
        // Dış daireyi büyüt
        if (d.depth === 2) {
            return d.y1 * radius * 1.15; // %15 daha büyük
        }
        return d.y1 * radius;
    });
  
// Önce mevcut SVG'yi temizle
d3.select("#chart svg").remove();

// SVG oluşturma
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", [-width / 2, -height / 2, width, width])
    .style("font-family", "'Times New Roman', Times, serif")
    .style("max-width", "400px")
    .style("display", "block")
    .style("margin", "auto")
    .style("overflow", "visible");

// Path ve label kısmını bir g (group) elementi içine alalım
const g = svg.append("g");

// Path oluşturma
const path = g.selectAll("path")
  .data(root.descendants().slice(1))
  .join("path")
  .attr("fill", d => {
    // Ana kategoriler için
    if (d.depth === 1) {
      return colorMap[d.data.name];
    }
    // Alt kategoriler için parent'ın rengini kullan
    return colorMap[d.parent.data.name];
  })
  .style("fill", function(d) {
    // Style ile de rengi uygula
    if (d.depth === 1) {
      return colorMap[d.data.name];
    }
    return colorMap[d.parent.data.name];
  })
  .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
  .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
  .attr("d", d => arc(d.current));
  
path.filter(d => d.children)
  .style("cursor", "pointer")
  .on("click", clicked);
  
path.append("title")
    .text(d => {
        const ancestors = d.ancestors().map(d => d.data.name).reverse().join("/");
        const value = d.value.toFixed(4);
        const abbrv = d.data.abbreviation ? ` (${d.data.abbreviation})` : '';
        const weight = d.parent && d.parent.data.weight ? 
            `\nGroup Weight: ${d.parent.data.weight}` : '';
        const localWeight = d.data.localWeight ? 
            `\nLocal Weight: ${d.data.localWeight.toFixed(4)}` : '';
        return `${ancestors}${abbrv}\nGlobal Weight: ${value}${weight}${localWeight}`;
    });
  
// Label oluşturma
const label = g.append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35em")
    .attr("fill-opacity", d => +labelVisible(d.current))
    .attr("transform", d => labelTransform(d.current))
    .style("font-family", "'Times New Roman', Times, serif")
    .each(function(d) {
        const textElement = d3.select(this);
        
        if (d.depth === 2) {
            // Dış daire elemanları için
            const availableWidth = (d.y1 - d.y0) * radius * 0.9;
            const fontSize = "9px"; // Dış daire yazıları için uygun boyut
            
            // Kriter ismi
            const nameElement = textElement.append("tspan")
                .attr("x", 0)
                .attr("dy", "-1.2em")
                .style("font-size", fontSize)
                .style("font-weight", "bold");

            if (d.data.name === "Memberships In Associations and Initiatives") {
                nameElement.text("Memberships In")
                    .style("font-size", fontSize);
                
                textElement.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.1em")
                    .style("font-size", fontSize)
                    .style("font-weight", "bold")
                    .text("Associations");
                
                textElement.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.1em")
                    .style("font-size", fontSize)
                    .style("font-weight", "bold")
                    .text("and Initiatives");
                
                const weightLine = textElement.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "0.9em")
                    .style("font-size", weightFontSize)
                    .style("font-weight", "bold");
                
                weightLine.append("tspan")
                    .text(`L:${d.data.localWeight.toFixed(3)} `);
                
                weightLine.append("tspan")
                    .text(`G:${d.data.value.toFixed(3)}`);
            } else {
                // Diğer metinler için normal kontrol
                nameElement.text(d.data.name);
                if (nameElement.node().getComputedTextLength() > availableWidth) {
                    const words = d.data.name.split(' ');
                    const midpoint = Math.ceil(words.length / 2);
                    nameElement.text(words.slice(0, midpoint).join(' '));
                    
                    textElement.append("tspan")
                        .attr("x", 0)
                        .attr("dy", "1.2em")
                        .style("font-size", fontSize)
                        .style("font-weight", "bold")
                        .text(words.slice(midpoint).join(' '));
                }

                // Normal weight değerleri
                textElement.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.4em")
                    .style("font-size", fontSize)
                    .text(`LW: ${d.data.localWeight.toFixed(3)}`);

                textElement.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.2em")
                    .style("font-size", fontSize)
                    .text(`GW: ${d.data.value.toFixed(3)}`);
            }
        } else {
            // İç daireler için
            textElement.append("tspan")
                .attr("x", 0)
                .style("font-size", d.depth === 1 ? "11px" : "10px") // Ana kategoriler için uygun boyut
                .style("font-weight", d.depth === 1 ? "bold" : "normal")
                .text(d.data.name);

            // Ana kategoriler için weight değerleri
            if (d.data.name === "Governance" || d.data.name === "Social" || d.data.name === "Environmental") {
                textElement.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.2em")
                    .style("font-size", "10px")
                    .text(`(${d.value.toFixed(3)})`);
            }
        }
    });
  
  const parent = svg.append("circle")
    .datum(root)
    .attr("r", radius)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("click", clicked);
  
  function clicked(event, p) {
    parent.datum(p.parent || root);
  
    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });
  
    const t = svg.transition().duration(event.altKey ? 7500 : 750);
  
    path.transition(t)
      .tween("data", d => {
        const i = d3.interpolate(d.current, d.target);
        return t => d.current = i(t);
      })
      .filter(function(d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
      .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
      .attrTween("d", d => () => arc(d.current));
  
    label.filter(function(d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
  }
  
  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }
  
  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }
  
  function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    let y = ((d.y0 + d.y1) / 2 * radius);
    
    // Dış daire yazılarını genişletilmiş alana taşı
    if (d.depth === 2) {
        y = y * 1.08; // Yazıları dışa doğru kaydır
    }
    
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }
  