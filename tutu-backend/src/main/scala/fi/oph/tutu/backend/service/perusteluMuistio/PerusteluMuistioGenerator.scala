package fi.oph.tutu.backend.service.perustelumuistio

import fi.oph.tutu.backend.domain.{Hakemus, Perustelu}

def generate(
  hakemusMaybe: Option[Hakemus],
  perusteluMaybe: Option[Perustelu]
): String = {
  var result = ""
  result = result ++ "Ratkaisutyyppi: RO (986/1998), päätös suomeksi"
  result = result ++ "\n\n"
  result =
    result ++ "Aika kirjauspäivämäärästä esittelypäivämäärään: -,9kk\nAika hakijan viimeisestä asiakirjasta ratkaisupäivämäärään: 4,5kk"
  result = result ++ "\n\n"
  result = result ++ "Hakija, Harri\n11.2.1980"
  result = result ++ "\n\n"
  result =
    result ++ "Duis id maximus nulla. Sed pretium vitae tellus ac sollicitudin. Donec  sodales dapibus turpis, eget sodales urna ullamcorper at. Suspendisse  vitae dignissim velit, in porta arcu. Aenean sit amet risus sagittis,  blandit arcu et, vulputate justo. \nIn cursus consequat tellus, quis  tempor tellus ornare ut. Aenean dolor lorem, varius a purus quis, dictum  tincidunt odio. Praesent id ornare neque. Orci varius natoque penatibus  et magnis dis parturient montes, nascetur ridiculus mus. Sed mattis  luctus massa. Duis sodales tincidunt nibh vitae interdum. Phasellus sit  amet libero ligula. \nSed euismod lectus sit amet dolor tempor tincidunt.  Nullam hendrerit pellentesque nisl id porta. Mauris posuere quis massa  vitae vestibulum. Etiam blandit libero a lorem blandit, vitae pharetra  quam bibendum."
  result = result ++ "\n\n"
  result =
    result ++ "In nec dictum est. Nam congue, quam interdum pellentesque ullamcorper,  ex lectus placerat purus, eu cursus elit felis vitae orci. \nNullam  tempus, mauris eget ultricies feugiat, enim quam tincidunt lectus, quis  iaculis risus leo non velit. Vivamus sodales blandit faucibus. Ut a diam  ac dolor pretium ullamcorper sed quis orci."
  result = result ++ "\n\n"
  result =
    result ++ "nteger convallis in elit eu finibus. Vivamus egestas libero at erat  ullamcorper malesuada. Ut sit amet semper nunc, vitae egestas libero.  Nam iaculis, diam vitae auctor posuere, enim elit tempor lorem, quis  placerat felis enim vel urna. Fusce augue eros, vehicula vel mauris et,  egestas facilisis erat. \nPellentesque sit amet sapien eget neque suscipit  sagittis eget eu sem. Morbi nec auctor leo. Nam suscipit, quam  fermentum ullamcorper pulvinar, lorem lorem tristique dolor, dapibus  posuere lacus sem ac turpis. Suspendisse lobortis rutrum urna sed  ullamcorper. Pellentesque quis sodales nibh. Phasellus eu lobortis  turpis, a bibendum nisi. Vestibulum posuere pretium eros, ut ornare  risus laoreet a. Suspendisse potenti."

  result
}
