function validateInputs(inputs) {
  for (var i = 0; i < inputs.length; i++) {
    if (isNaN(inputs[i])) {
      alert("Must fill out all fields!");
      return true;
    }
    if (inputs[i] < 0 || inputs[i] > 1) {
      alert("Invalid inputs: inputs must be a valid probability (a positive float number between 0 <= x <= 1).");
      return true;
    }
  }
  return false;
}

function viterbi(obs_probs, deltas_0, tran_probs, observations) {
  psi = [];
  deltas = [];
  deltas.push(deltas_0);

  for (var t = 0; t < observations.length; t++) {
    psi.push([0, 0]);
    deltas.push([0, 0]);

    var umbrella_brought = observations[t];
    for (var s = 0; s < 2; s++) {
      var obs_probability = 0;
      if (umbrella_brought) {
        obs_probability = obs_probs[s];
      }
      else {
        obs_probability = 1 - obs_probs[s];
      }

      max_prob = 0;
      best_prev = 0;
      for (var prev_s = 0; prev_s < 2; prev_s++) {
        var calculation = deltas[t][prev_s] * tran_probs[prev_s][s] * obs_probability;
        if (calculation > max_prob) {
          max_prob = calculation;
          best_prev = prev_s;
        }
      }
      deltas[t+1][s] = max_prob;
      psi[t][s] = best_prev;
    }
  }
  console.log("Calculated deltas:", deltas);
  console.log("Calculated psi:", psi);

  // update tables
  for (var t = 1; t < deltas.length; t++) {
    for (var s = 0; s < deltas[t].length; s++) {
      var id = "d_" + t + s;
      document.getElementById(id).innerHTML= deltas[t][s].toFixed(3);
    }
  }

  for (var t = 0; t < psi.length; t++) {
    for (var s = 0; s < psi[t].length; s++) {
      var id = "p_" + t + s;
      document.getElementById(id).innerHTML= psi[t][s];
    }
  }

  // Get best possible sequence of weathers
  var best_prediction = 0;
  if (deltas[deltas.length - 1][0] >= deltas[deltas.length - 1][1]) {
    best_prediction = 0;
  }
  else {
    best_prediction = 1;
  }
  console.log("Most possible weather:", best_prediction);
  document.getElementById("prediction_Fri").innerHTML= "It is more likely to be " + map_weather(best_prediction) + " at t = 5.";

  // trace back path
  var path = []
  trace_path(path, psi, psi.length, best_prediction);
  path.push(map_weather(best_prediction));
  return path;
}

function trace_path(path, psi, t, w) {
  t--;
  var prev_w = psi[t][w];
  if (t != 0) {
    trace_path(path, psi, t, prev_w);
  }
  path.push(map_weather(prev_w));
  return;
}

function map_weather(w){
  if (w == 0) {
    return "Rainy";
  }
  return "Sunny";
}

function predict() {
  // parse inputs
  inputs = [parseFloat(document.getElementById('P_Um_R').value),
            parseFloat(document.getElementById('P_Um_S').value),
            parseFloat(document.getElementById('delta_0_R').value),
            parseFloat(document.getElementById('delta_0_S').value),
            parseFloat(document.getElementById('tran_R_R').value),
            parseFloat(document.getElementById('tran_R_S').value),
            parseFloat(document.getElementById('tran_S_R').value),
            parseFloat(document.getElementById('tran_S_S').value)];

  // validate inputs
  if (validateInputs(inputs)) {
    return;
  }

  // initialize lists
  var obs_probs = [inputs[0], inputs[1]];
  var deltas_0 = [inputs[2], inputs[3]];
  var tran_probs = [[inputs[4], inputs[5]],
                  [inputs[6], inputs[7]]];

  var observations = []
  var obs = document.getElementsByClassName("form-input-yes");
  for (var i = 0; i < obs.length; i++) {
    observations.push(obs[i].checked);
  }

  console.log("Datas:", obs_probs, deltas_0, tran_probs, observations);
  path = viterbi(obs_probs, deltas_0, tran_probs, observations);
  console.log("Best possible sequence of weathers:", path);
  document.getElementById("sequence").innerHTML = "Sequence of weathers from t = 0 to t = 5 is: " + path;

  // change result seciont to visible
  document.getElementById("results").style = "block";
  return;
}

function sample() {
  document.getElementById("P_Um_R").value="0.9";
  document.getElementById("delta_0_R").value="0.5";
  document.getElementById("tran_R_R").value="0.5";
  document.getElementById("tran_R_S").value="0.5";
  document.getElementById("P_Um_S").value="0.2";
  document.getElementById("delta_0_S").value="0.5";
  document.getElementById("tran_S_R").value="0.2";
  document.getElementById("tran_S_S").value="0.8";
  document.getElementById("obs-3-2").checked = true;
}
