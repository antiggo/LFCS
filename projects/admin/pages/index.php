<meta charset="utf8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, userpic-scalable=0, viewport-fit=cover">
<meta property="og:title" content="LFCS — Legal Design Studio">
<link rel="icon" href="../../../assets/favicon.png"/>

<script type="text/javascript" src="../../../build/admin/build.js"></script>
<link type="text/css" rel="stylesheet" href="../../../build/admin/build.css">

<script type="text/javascript">
	(function() {
	emailjs.init("user_CW02cvPSzUjSVMIarplV5");
	})();
</script>

<title>LFCS admin</title> 

<script type="bml">
    <App color="#7D7D7D" text="#D8D8D8">

        <Title>Новый счет $$$</Title>
		<Admin>
			<form>
				<item>
					<input type="email" id="email" requred placeholder="Кому (почта)"></input>
				</item>

				<letter>

				<logo/>
				<dot/>
				<item>
					<text>
						Данное письмо повторяет существенные условия договора, указанные в счете, который вам отправил наш агент, ЮКасса. Оплачивая счет, вы заключаете с ООО «ЮФКР» договор оказания услуг на условиях, изложенных на странице lfcs.design/terms.
					</text>
				</item>
				<item>
					<separator></separator>
				</item>
				<services>
					<addservice>добавить продукт</addservice>
					<service>
						<servicePrice placeholder="Цена, ₽"></servicePrice>
						<naming>
							<serviceType>Описание продукта </serviceType>
							<serviceName placeholder="Продукт"></serviceName>
						</naming>
						<details>
							<row>
								<detailsTitle>Особые пожелания </detailsTitle>
								<detailsValue></detailsValue>
							</row>
							<row>
								<detailsTitle>Объем документа</detailsTitle>
								<detailsValue></detailsValue>
							</row>
							<row>
								<detailsTitle>Срок выполнения </detailsTitle>
								<detailsValue></detailsValue>
							</row>
						</details>
						<serviceRemove>удалить</serviceRemove>
					</service>
				</services>
				<summary>
					<summaryTitle>итого, без ндс</summaryTitle>
					<summaryPrice placeholder="Цена, ₽"></summaryPrice>
				</summary>
				<deadline>
					<deadlineTitle>Срок действия оферты — до</deadlineTitle>
					<deadlineDate placeholder="Дата"></deadlineDate>
				</deadline>
				<item>
					<action>отправить</action>
				</item>
				</letter>
			</form>
		</Admin>
        

    </App>
</script>