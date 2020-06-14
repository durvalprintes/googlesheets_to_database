module.exports = {
  connection: "postgresql://postgres:postgres@192.168.99.100:5432/rbe",
  sheets: [
    {
      // id: "1Dei410J8sMX65BKuoVBakSKgaDT4pHgNes7JDe8DVfk", // DZC_Dom_Zico"
      id: "1Y2D-MZYCZsjDBozDapkIRV3elho9gkSA53ihQ7azTXA", //TESTE
      cnes: "0090301",
    },
    {
      id: "1hVaqghbnwu95rnGBV0kZoqKLWcgiOIg7BtRX7fCEvmg", // "HBP_Beneficiencia_Portuguesa"
      cnes: "2332671",
    },
    {
      id: "1usFAPwPzkbaQjCygn6xjKyAo-Lkusp9F_9rFJ_e8Zko", // "HGM_MOSQUEIRO"
      cnes: "4005759",
    },
    {
      id: "1q_UpdWhAJcAksXaeB5vO0Lb80vnuQPTtTXDGyroqzeg", // "HPSM_Guama"
      cnes: "2694778",
    },
    {
      id: "1TwHyvvZ5vvAhni3frDxvZWipMIDIFU2Ea5RbDWfQ7uQ", // "HPSM14_Mario_Pinotti"
      // id: "1SHlnlIEoxqQR9Wak_N6e7DHE00aVQUa9MNRywooFOPs", //TESTE
      cnes: "2337339",
    },
  ],
  /* insert:
    " INSERT INTO cov.diario_atendimento(co_cnes, dt_atendimento, qt_leitosclinicos," +
    " qt_leitosclinicosocupados, qt_leitosur, qt_leitosuti, qt_leitosurocupados," +
    " qt_leitosutiocupados, qt_geralleitosinternacoes, qt_atendimentos_geral," +
    " qt_atendimentos_covidleve, qt_atendiementos_covidmoderada," +
    " qt_atendimentos_covidgrave, qt_obitossuspeitos, qt_obitosconfirmados) VALUES %L " +
    // " ON CONFLICT ON CONSTRAINT diario_atendimento_idx DO UPDATE SET" +
    // " qt_leitosclinicos = EXCLUDED.qt_leitosclinicos," +
    // " qt_leitosclinicosocupados = EXCLUDED.qt_leitosclinicosocupados," +
    // " qt_leitosur = EXCLUDED.qt_leitosur, qt_leitosuti = EXCLUDED.qt_leitosuti," +
    // " qt_leitosurocupados = EXCLUDED.qt_leitosurocupados, " +
    // " qt_leitosutiocupados = EXCLUDED.qt_leitosutiocupados," +
    // " qt_geralleitosinternacoes = EXCLUDED.qt_geralleitosinternacoes," +
    // " qt_atendimentos_geral = EXCLUDED.qt_atendimentos_geral," +
    // " qt_atendimentos_covidleve = EXCLUDED.qt_atendimentos_covidleve," +
    // " qt_atendiementos_covidmoderada = EXCLUDED.qt_atendiementos_covidmoderada, " +
    // " qt_atendimentos_covidgrave = EXCLUDED.qt_atendimentos_covidgrave," +
    // " qt_obitossuspeitos = EXCLUDED.qt_obitossuspeitos, " +
    // " qt_obitosconfirmados = EXCLUDED.qt_obitosconfirmados " +
    // " RETURNING id_registro",
  delete: "DELETE FROM cov.diario_atendimento WHERE dt_atendimento IN (%L)", */
  sheetColumns: [
    "DATA",
    "TOTAL DE LEITOS (CLINICOS / OBS)",
    "INTERNAÇÕES - LEITOS OCUPADOS (CLINICOS)",
    "TOTAL DE LEITOS (UR)",
    "TOTAL DE LEITOS (UTI)",
    "INTERNAÇÕES - LEITOS OCUPADOS (UR)",
    "INTERNAÇÕES - LEITOS OCUPADOS (UTI)",
    "N° TOTAL DE INTERNAÇÕES (CLINICO+UTI)",
    "N° atendimentos no dia (COVID-19 + Outras Patologias)",
    "ATENDIMENTOS COVID (LEVES)",
    "N° INTERNAÇÕES COVID (MODERADOS)",
    "N° INTERNAÇÕES GRAVES  (UR/UTI)",
    "Nº DE ÓBITOS SUSPEITOS DE COVID-19",
    "Nº DE ÓBITOS CONFIRMADOS DE COVID-19",
  ],
  table: {
    schema: "cov",
    name: "diario_atendimento",
    columns: [
      "id_registro",
      "co_cnes",
      "dt_atendimento",
      "qt_leitosclinicos",
      "qt_leitosclinicosocupados",
      "qt_leitosuti",
      "qt_leitosutiocupados",
      "qt_leitosur",
      "qt_leitosurocupados",
      "qt_geralleitosinternacoes",
      "qt_atendimentos_geral",
      "qt_atendimentos_covidleve",
      "qt_atendiementos_covidmoderada",
      "qt_atendimentos_covidgrave",
      "qt_obitossuspeitos",
      "qt_obitosconfirmados",
    ],
  },
  email: {
    service: "gmail",
    auth: {
      user: "durvalprintes@gmail.com",
      pass: "d061107V",
    },
  },
  handlebarsOptions: {
    viewEngine: {
      extname: ".hbs",
      layoutsDir: "src/email/",
      defaultLayout: "template",
      partialsDir: "src/email/",
    },
    viewPath: "src/email",
    extName: ".hbs",
  },
};
